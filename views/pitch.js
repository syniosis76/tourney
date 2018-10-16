export const pitch = {
  template: `
<div class="pitch card">
  <div class="pitchheader flexrow flexcenter">
    <h3>{{ pitch.name }}</h3>
    <div class="dropdown">      
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
          <th>Team 2</th>
          <th>Duty</th>            
        </tr>
      </thead>
      <tbody>
        <template v-for="index in maxGameCount() - 1">
          <template v-for="game in [pitch.games.data[index]]">                                  
            <tr v-on:click="selectGame($event)" v-on:mouseover="hoverGame($event)" v-on:mouseout="hoverGame(null)" :class="{ trselected: index === gameDate.selectedIndex, trhover: index === gameDate.hoverIndex }">
              <template v-if="game">         
                <td>{{ game.group }}</td>
                <td>{{ game.team1 }}</td>
                <td>{{ game.team2 }}</td>
                <td>{{ game.dutyTeam }}</td>                        
              </template>
              <template v-else>
                <td colspan="4"></td>
              </template>            
            </tr>
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
      Vue.set(this.gameDate, 'selectedIndex', index);    
    },
    hoverGame: function(event) {
      var index = -1;
      if (event) index = event.currentTarget.rowIndex;
      Vue.set(this.gameDate, 'hoverIndex', index);
    }
  }    
};