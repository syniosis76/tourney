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
            <template v-for="game in [pitch.games.data[index]]">                                  
              <tr v-on:click="selectGame($event)" v-on:mouseover="hoverGame($event)" v-on:mouseout="hoverGame(null)" v-on:dblclick="editGame(pitch, game)" :class="{ trselected: index === gameDate.selectedIndex, trhover: index === gameDate.hoverIndex, searchrow: rowSearchMatches(index, tournament.searchText) }">
                <template v-if="game">         
                  <td :class="{ searchitem: searchMatches(game.group, tournament.searchText) }">
                    <input v-if="game.editing" v-model="game.group" class="gameinputshort"/>
                    <template v-else>{{ game.group }}</template>  
                  </td>
                  <td :class="{ searchitem: searchMatches(game.team1, tournament.searchText) }">
                    <input v-if="game.editing" v-model="game.team1" class="gameinput"/>
                    <template v-else>{{ game.team1 }}</template>                    
                  </td>
                  <td class="flexrow">
                    <template v-if="game.editing">
                      <input v-model="game.team1Score" type="number" class="scoreinput"/>                    
                      <div>&nbsp;-&nbsp;</div>
                      <input v-model="game.team2Score" type="number" class="scoreinput"/>
                    </template>
                    <template v-else-if="game.status != 'pending'">
                      <div :class="{ scorewin: game.team1Score > game.team2Score, scoredraw: game.team1Score === game.team2Score, scorelose: game.team1Score < game.team2Score }">{{ game.team1Score }}</div>
                      <div>&nbsp;-&nbsp;</div>
                      <div :class="{ scorewin: game.team2Score > game.team1Score, scoredraw: game.team2Score === game.team1Score, scorelose: game.team2Score < game.team1Score }">{{ game.team2Score }}</div>
                    </template>
                  </td>
                  <td :class="{ searchitem: searchMatches(game.team2, tournament.searchText) }">                
                    <input v-if="game.editing" v-model="game.team2" class="gameinput"/>
                    <template v-else>{{ game.team2 }}</template>
                  </td>
                  <td :class="{ searchitem: searchMatches(game.dutyTeam, tournament.searchText) }">                  
                    <input v-if="game.editing" v-model="game.dutyTeam" class="gameinput"/>
                    <template v-else>{{ game.dutyTeam }}</template>
                  </td>
                  <td v-if="tournament.canEdit">
                    <div v-if="game.editing" class="flexrow">
                      <svg v-on:click="saveGame(pitch, game)" class="save-button"><use xlink:href="/html/icons.svg/#tick-circle"></use></svg>
                      <svg v-on:click="cancelGame(pitch, game)" class="cancel-button"><use xlink:href="/html/icons.svg/#cross-circle"></use></svg>
                    </div>
                    <template v-else>
                      <svg v-on:click="editGame(pitch, game)" class="edit-button"><use xlink:href="/html/icons.svg/#edit-circle"></use></svg>                        
                    </template>
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

      if (game.status === "pending") game.status = "scoreset";

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
        _this.refresh();
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
      if (this.gameDate.gameTimes && this.gameDate.gameTimes.data) {
        count = this.gameDate.gameTimes.data.length
      };
      this.gameDate.pitches.data.forEach(pitch => {
        if (pitch.games.data.length > count) count = pitch.games.data.length;
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
        for (let pitch of this.gameDate.pitches.data) {
          let game = pitch.games.data[index];
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
      pitch.games.data.forEach(gameItem => {
        if (gameItem !== game && gameItem.editing) gameItem.editing = false;
      });

      if (this.tournament.canEdit) {
        game.editing = true;
      }
    },
    saveGame(pitch, game) {
      game.editing = false;
      this.putGame(pitch, game);      
    },
    cancelGame(pitch, game) {
      this.refresh();
    }
  }    
};