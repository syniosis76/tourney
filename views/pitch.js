export const pitch = {
  template: `
<div class="pitch card">
  <div class="flexrow flexcenter">
    {{ pitch.name }}
    <div class="dropdown">
      <div v-on:click="localShowDropdown('pitchDropdown' + pitch.id.value)" class="dropdown-button"></div>
      <div :id="'pitchDropdown' + pitch.id.value" class="dropdown-content">        
        <a v-on:click="pasteGames">Paste Games</a>        
      </div>
    </div>
  </div>
  <div>
    <table id="games" class="draw">
      <thead>
        <tr>
          <th>Group</th>
          <th>Team 1</th>            
          <th>Team 2</th>
          <th>Duty</th>            
        </tr>
      </thead>
      <tbody>
        <tr v-for="index in maxGameCount()">
          <template v-for="game in [pitch.games.data[index]]">
            <template v-if="game">         
              <td>{{ game.group }}</td>
              <td>{{ game.team1 }}</td>
              <td>{{ game.team2 }}</td>
              <td>{{ game.dutyTeam }}</td>
            </template>
            <template v-else>
              <td colspan="4"></td>
            </template>
          </template>
        </tr> 
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
    localShowDropdown: function(name) {
      showDropdown(name)
    },
    maxGameCount: function()
    {
      var count = 0;
      this.gameDate.pitches.data.forEach(pitch => {
        if (pitch.games.data.length > count) count = pitch.games.data.length;
      });
      return count;
    }
  }    
};