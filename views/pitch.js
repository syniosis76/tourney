import {scoreEditor} from '/views/scoreEditor.js';

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
        </tr>
      </thead>
      <tbody>
        <template v-if="maxGameCount() > 0">
          <template v-for="(value, index) in maxGameCount()">
            <template v-for="game in [pitch.games.data[index]]">                                  
              <tr v-on:click="selectGame($event)" v-on:mouseover="hoverGame($event)" v-on:mouseout="hoverGame(null)" v-on:dblclick="editGame($event, game)" :class="{ trselected: index === gameDate.selectedIndex, trhover: index === gameDate.hoverIndex }">
                <template v-if="game">         
                  <td style="position: relative;">{{ game.group }}</td>
                  <td>{{ game.team1 }}</td>
                  <td class="flexrow">
                    <template v-if="game.status != 'pending'">
                      <div :class="{ scorewin: game.team1Score > game.team2Score, scoredraw: game.team1Score === game.team2Score, scorelose: game.team1Score < game.team2Score }">{{ game.team1Score }}</div>
                      <div>&nbsp;-&nbsp;</div>
                      <div :class="{ scorewin: game.team2Score > game.team1Score, scoredraw: game.team2Score === game.team1Score, scorelose: game.team2Score < game.team1Score }">{{ game.team2Score }}</div>
                    </template>
                  </td>
                  <td>{{ game.team2 }}</td>
                  <td>{{ game.dutyTeam }}</td>                        
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
  props: ['tournament', 'gameDate', 'pitch'],
  data () {
    return {
      loading: false,
    }
  },
  created () {
    
  },
  methods:
  {
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
            //_this.$router.go(0)
          })
          .fail(function (error) {
            console.log(error);        
            alert('Unable to paste games')
          });
        });        
      }
    },
    localShowDropdown: function(event, name) {
      showDropdown(event, name)
    },
    maxGameCount: function()
    {
      var count = 0;
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
    editGame(event, game) {
      // Remove existing editor
      var element = document.getElementById('inlinescoreEditor');
      if (element) element.parentNode.removeChild(element);

      if (this.canEdit) {
        var ComponentClass = Vue.extend(scoreEditor)
        var instance = new ComponentClass({
            propsData: { tournament: this.tournament, gameDate: this.gameDate, pitch: this.pitch, game: game }
        })      
        instance.$mount() // pass nothing  
        var tr = event.currentTarget;
        var td = tr.firstChild;
        td.appendChild(instance.$el);
      }
    }
  }    
};