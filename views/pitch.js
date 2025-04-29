import {gameEditor} from '/views/gameEditor.js';
import {textEditor} from '/views/textEditor.js';

export const pitch = {
  template: `
<div class="flexrow">
  <div v-if="pitch.gameTimes" class="fixedleft flexrow pitch" style="z-index: 1000">    
    <div class="card">      
      <div class="cardheader"></div>
      <table id="game-times" class="selectable">
        <thead>
          <tr><th>Time</th></tr>
        </thead>
        <tbody>
          <template v-if="maxGameCount() > 0">
            <template v-for="(value, index) in maxGameCount()">
              <tr v-on:click="selectGame($event)" v-on:mouseover="hoverGame($event)" v-on:mouseout="hoverGame(null)" :style="getRowStyle(index, $root.$data.searchText)">  
                <td><template v-if="pitch.gameTimes && pitch.gameTimes.length > index">{{ pitch.gameTimes[index] }}</template></td>
              </tr>
            </template>
          </template>
        </tbody>    
      </table>
    </div>
  </div>
  <div class="pitch card">
    <div class="cardheader flexrow flexcenter">
      <h3>{{ pitch.name }}</h3>
      <div v-if="tournament.canEdit" class="dropdown">      
        <svg v-on:click="localShowDropdown($event, 'pitchDropdown' + pitch.id.value)" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>
        <div :id="'pitchDropdown' + pitch.id.value" class="dropdown-content">        
          <a v-on:click="pasteGames">Paste Games</a>        
          <a v-on:click="editName">Edit Name</a>
          <a v-on:click="pasteGameTimes">Paste Game Times</a>        
          <a v-on:click="clearGameTimes">Clear Game Times</a>
          <div class="dropdown-text">Only add game times if different from main times.</div>        
        </div>
      </div>
    </div>
    <div>    
      <table id="games" class="selectable">
        <thead>
          <tr>
            <th>Group</th>
            <th>Team 1</th>
            <th></th>    
            <th>Team 2</th>          
            <th>Duty</th>
            <td v-if="tournament.canEdit"></td>
          </tr>
        </thead>
        <tbody>
          <template v-if="maxGameCount() > 0">
            <template v-for="(value, index) in maxGameCount()">
              <template v-for="game in [pitch.games[index]]">                                  
                <tr v-on:click="selectGame($event)" v-on:mouseover="hoverGame($event)" v-on:mouseout="hoverGame(null)" v-on:dblclick="editGame(pitch, game)" :style="getRowStyle(index, $root.$data.searchText)">
                  <template v-if="game">         
                    <td :class="{ searchitem: searchMatches(game.group, $root.$data.searchText) > 0 }">{{ game.group }}</td>
                    <td :class="{ searchitem: searchMatches(game.team1, $root.$data.searchText) > 0 }">{{ game.team1 }}</td>                  
                    <td class="flexrow" v-on:click="editGame(pitch, game)">
                      <template v-if="game.status !== 'pending' && game.team1 && game.team2">
                        <div :class="{ scoreactive: game.status === 'active', scorewin: game.status === 'complete' && game.team1Score > game.team2Score, scoredraw: game.status === 'complete' && game.team1Score === game.team2Score, scorelose: game.status === 'complete' && game.team1Score < game.team2Score }">{{ game.team1Score }}</div>
                        <div :class="{ scoreactive: game.status === 'active' }">&nbsp;-&nbsp;</div>
                        <div :class="{ scoreactive: game.status === 'active', scorewin: game.status === 'complete' && game.team2Score > game.team1Score, scoredraw: game.status === 'complete' && game.team2Score === game.team1Score, scorelose: game.status === 'complete' && game.team2Score < game.team1Score }">{{ game.team2Score }}</div>                    
                      </template>
                    </td>
                    <td :class="{ searchitem: searchMatches(game.team2, $root.$data.searchText) > 0 }">{{ game.team2 }}</td>
                    <td :class="{ searchitem: searchMatches(game.dutyTeam, $root.$data.searchText) > 0 }">{{ game.dutyTeam }}</td>
                    <td v-if="tournament.canEdit">
                      <svg v-on:click="editGame(pitch, game)" class="edit-button"><use xlink:href="/html/icons.svg/#edit-circle"></use></svg>                                          
                    </td>
                  </template>
                  <template v-else>
                    <td colspan="5"></td>
                  </template>            
                </tr>
              </template>
            </template> 
          </template>
        </tbody>    
      </table>
    </div>  
  </div>
</div>
`,
  props: ['tournament', 'gameDate', 'pitch', 'searchText'],
  data () {
    return {
      loading: false,
    }
  },
  created () {
    
  },
  methods:
  {
    refresh: function() {
      this.$parent.refresh();
    },
    sendData: function(route, data, refresh) {
      var _this = this
      if (_this.pitch != undefined)
      {
        oboe({
            method: 'PUT',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/' + route,
            body: data
        })
        .done(function(tournament)
        {
          if (refresh)
          {
            _this.refresh();
          }
        })
        .fail(function (error) {
          console.log(error);        
          alert('Oops. Something went wrong.');
        });      
      }
    },
    pasteGames: function(pitchId)
    {
      navigator.clipboard.readText()
      .then(clipboardText => {          
        var data = { 'mode': 'replace', 'clipboardText': clipboardText };
        this.sendData('paste', data, true);
      })
      .catch(error => {
        alert('Error reading from the clipboard:\n  ' + error.message + '\nCheck the site settings from the url bar.');
      }); 
    },
    pasteGameTimes: function(pitchId)
    {
      navigator.clipboard.readText().then(clipboardText => {          
        var data = { 'clipboardText': clipboardText };
        this.sendData('pastegametimes', data, true);
      })
      .catch(error => {
        alert('Error reading from the clipboard:\n  ' + error.message + '\nCheck the site settings from the url bar.');
      }); 
    },
    editName: function(pitchId)
    {
      if (this.tournament.canEdit) {
        var _this = this;
        const instance = Vue.createApp(textEditor, { text: _this.pitch.name
                , onSave:  function(text) {
              var data = { 'name': text };
              _this.sendData('editname', data, true);                
            }});
        instance.config.globalProperties.$googleUser = this.$googleUser;
        instance.config.compilerOptions.whitespace = 'codense'
        instance.mount('#modal-parent');  
      }
    },
    clearGameTimes: function(pitchId) {
      navigator.clipboard.readText().then(clipboardText => {                    
        var data = { };
        this.sendData('cleargametimes', data, true);
      })
      .catch(error => {
        alert('Error reading from the clipboard:\n  ' + error.message + '\nCheck the site settings from the url bar.');
      }); 
    },
    putGame: function(pitch, game) {
      var data = { "group": game.group,
        "team1": game.team1,
        "team1Score": game.team1Score,
        "team2": game.team2,
        "team2Score": game.team2Score,
        "dutyTeam": game.dutyTeam,
        "status": game.status
      };
      this.sendData('game/' + game.id.value, data, false);
    },
    localShowDropdown: function(event, name) {
      showDropdown(event, name)
    },
    maxGameCount: function()
    {
      var count = 0
      if (this.gameDate) {      
        if (this.gameDate.gameTimes) {
          count = this.gameDate.gameTimes.length
        };
        this.gameDate.pitches.forEach(pitch => {
          if (pitch.games.length > count) count = pitch.games.length;
          if (pitch.gameTimes && pitch.gameTimes.length > count) count = pitch.gameTimes.length;
        });
      }
      return count;
    },
    selectGame: function(event) {
      var index = event.currentTarget.rowIndex;      
      this.gameDate['selectedIndex'] = index - 1;    
    },
    hoverGame: function(event) {
      var index = 0;
      if (event) index = event.currentTarget.rowIndex;
      this.gameDate['hoverIndex'] = index - 1;
    },
    textMatches: function(text, matchText)
    {
      return matchText === text || (matchText.length >= 3 && text.includes(matchText));
    },
    searchMatches: function(text, searchText) {
      let result = 0
      if (text && searchText) {                        
        let lowerText = text.toLowerCase();
        let lowerSearchText = searchText.toLowerCase();
        let searchParts = lowerSearchText.split(',')
        for (let index in searchParts) {
          let part = searchParts[index].trim()
          if (this.textMatches(lowerText, part)) {
            result = result | Math.pow(2, index);
          }
        }        
      }
      return result;
    },
    rowSearchMatches: function(index, searchText) {
      let result = 0
      if (searchText) {
        for (let pitch of this.gameDate.pitches) {
          let game = pitch.games[index];
          if (game) {
            result = result | this.searchMatches(game.group, searchText);
            result = result | this.searchMatches(game.team1, searchText);
            result = result | this.searchMatches(game.team2, searchText);
            result = result | this.searchMatches(game.dutyTeam, searchText);
          }
        }
      }
      return result;
    },
    getRowStyle: function(index, searchText) {
      let result = this.rowSearchMatches(index, searchText);      
      
      let color = "#ffffff";

      let c1 = "#FDF0CA";
      let c2 = "#E4CBD6";
      let c3 = "#D4E5CE";

      if (this.gameDate.hoverIndex == index)
      {
        color = "#eeeeff 100%";
      }          
      else if ((result & 1) == 1 && (result & 2) == 2 && (result & 4) == 4) {
        color = c1 + "," + c2 + "," + c3;
      }
      else if ((result & 1) == 1 && (result & 2) == 2) {
        color = c1 + "," + c2;
      }
      else if ((result & 1) == 1 && (result & 4) == 4) {
        color = c1 + "," + c3;
      }
      else if ((result & 2) == 2 && (result & 4) == 4) {
        color = c2 + "," + c3;
      }
      else if ((result & 2) == 2) {
        color = "#FFFFFF," + c2;
      }
      else if ((result & 4) == 4) {
        color = "#FFFFFF," + c3;
      }
      else if (result > 0) {
        color = "#FFFFFF," + c1;
      }
      else if (this.gameDate.selectedIndex == index)
      {
        color = "#eeeeff 100%";
      }

      return "background-image: linear-gradient(to bottom, " + color + ");";
    },
    editGame(pitch, game) {    
      const instance = Vue.createApp(gameEditor, { tournament: this.tournament, gameDate: this.gameDate, pitch: this.pitch, game: game });
      instance.config.globalProperties.$googleUser = this.$googleUser;
      instance.config.compilerOptions.whitespace = 'codense'
      instance.mount('#modal-parent');      
    },
    saveGame(pitch, game) {      
      this.putGame(pitch, game);      
    },
    cancelGame(pitch, game) {
      this.refresh();
    }
  }    
};