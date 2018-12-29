import {gameEditor} from '/views/gameEditor.js';

export const pitch = {
  template: `
<div class="pitch card">
  <div class="cardheader flexrow flexcenter">
    <h3>{{ pitch.name }}</h3>
    <div v-if="tournament.canEdit" class="dropdown">      
      <svg v-on:click="localShowDropdown($event, 'pitchDropdown' + pitch.id.value)" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>
      <div :id="'pitchDropdown' + pitch.id.value" class="dropdown-content">        
        <a v-on:click="pasteGames">Paste Games</a>        
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
              <tr v-on:click="selectGame($event)" v-on:mouseover="hoverGame($event)" v-on:mouseout="hoverGame(null)" v-on:dblclick="editGame(pitch, game)" :class="{ trselected: index === gameDate.selectedIndex, trhover: index === gameDate.hoverIndex, searchrow: rowSearchMatches(index, tournament.searchText) }">
                <template v-if="game">         
                  <td :class="{ searchitem: searchMatches(game.group, tournament.searchText) }">{{ game.group }}</td>
                  <td :class="{ searchitem: searchMatches(game.team1, tournament.searchText) }">{{ game.team1 }}</td>                  
                  <td class="flexrow">
                    <template v-if="game.status !== 'pending'">
                      <div :class="{ scorewin: game.team1Score > game.team2Score, scoredraw: game.team1Score === game.team2Score, scorelose: game.team1Score < game.team2Score }">{{ game.team1Score }}</div>
                      <div>&nbsp;-&nbsp;</div>
                      <div :class="{ scorewin: game.team2Score > game.team1Score, scoredraw: game.team2Score === game.team1Score, scorelose: game.team2Score < game.team1Score }">{{ game.team2Score }}</div>                    
                    </template>
                  </td>
                  <td :class="{ searchitem: searchMatches(game.team2, tournament.searchText) }">{{ game.team2 }}</td>
                  <td :class="{ searchitem: searchMatches(game.dutyTeam, tournament.searchText) }">{{ game.dutyTeam }}</td>
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
    pasteGames: function(pitchId)
    {
      var _this = this
      if (_this.pitch != undefined)
      {
        navigator.clipboard.readText()
        .then(clipboardText => {          
          console.log('Paste games for', _this.pitch.name, clipboardText);
          var data = { "mode": "replace", "clipboardText": clipboardText};
          oboe({
              method: 'PUT',
              url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/paste',
              body: data
          })
          .done(function(tournament)
          {
            _this.refresh();
          })
          .fail(function (error) {
            console.log(error);        
            alert('Unable to paste games')
          });
        });        
      }
    },
    putGame: function(pitch, game)
    {
      var _this = this

      console.log('Update game ', game.id.value);

      if (game.team1Score === '' || game.team2Score === '') {
        game.status = "pending";
        game.team1Score = 0;
        game.team2Score = 0;
      }
      else if (game.status === "pending") {
        game.status = "scoreset";
      }

      var data = { "group": game.group,
        "team1": game.team1,
        "team1Score": game.team1Score,
        "team2": game.team2,
        "team2Score": game.team2Score,
        "dutyTeam": game.dutyTeam,
        "status": game.status
      };

      oboe({
          method: 'PUT',
          url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + pitch.id.value + '/game/' + game.id.value,
          body: data
      })
      .done(function(tournament)
      {
        //_this.refresh();
      })
      .fail(function (error) {
        console.log(error);        
        alert('Unable to save game')
      });   
    },
    localShowDropdown: function(event, name) {
      showDropdown(event, name)
    },
    maxGameCount: function()
    {
      var count = 0
      if (this.gameDate.gameTimes && this.gameDate.gameTimes) {
        count = this.gameDate.gameTimes.length
      };
      this.gameDate.pitches.forEach(pitch => {
        if (pitch.games.length > count) count = pitch.games.length;
      });
      return count;
    },
    selectGame: function(event) {
      var index = event.currentTarget.rowIndex;      
      Vue.set(this.gameDate, 'selectedIndex', index - 1);    
    },
    hoverGame: function(event) {
      var index = 0;
      if (event) index = event.currentTarget.rowIndex;
      Vue.set(this.gameDate, 'hoverIndex', index - 1);
    },
    searchMatches: function(text, searchText) {
      if (text && searchText) {
        let lowerText = text.toLowerCase();
        let lowerSearchText = searchText.toLowerCase();
        return lowerText === lowerSearchText || (lowerSearchText.length >= 3 && lowerText.includes(lowerSearchText));
      }
      return false;
    },
    rowSearchMatches: function(index, searchText) {
      if (searchText) {
        for (let pitch of this.gameDate.pitches) {
          let game = pitch.games[index];
          if (game) {
            if (this.searchMatches(game.group, searchText)) return true;
            if (this.searchMatches(game.team1, searchText)) return true;
            if (this.searchMatches(game.team2, searchText)) return true;
            if (this.searchMatches(game.dutyTeam, searchText)) return true;        
          }
        }
      }
      return false;
    },
    editGame(pitch, game) {
      // Remove existing editor
      var element = document.getElementById('gameEditor');
      if (element) element.parentNode.removeChild(element);

      if (this.tournament.canEdit) {
        var ComponentClass = Vue.extend(gameEditor)
        var instance = new ComponentClass({
            propsData: { tournament: this.tournament, gameDate: this.gameDate, pitch: this.pitch, game: game }
        })      
        instance.$mount() // pass nothing  
         document.body.appendChild(instance.$el);
      }
    },
    saveGame(pitch, game) {      
      this.putGame(pitch, game);      
    },
    cancelGame(pitch, game) {
      this.refresh();
    }
  }    
};