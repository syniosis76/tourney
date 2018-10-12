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
      <col width="20%">
      <col width="30%">
      <col width="30%">
      <col width="20%">
      <thead>
        <tr>
          <th>Group</th>
          <th>Team 1</th>            
          <th>Team 2</th>
          <th>Duty</th>            
        </tr>
      </thead>
      <tbody>
        <tr v-for="game in pitch.games.data">
          <td :title="game.group">{{ game.group }}</td>
          <td :title="game.team1">{{ game.team1 }}</td>
          <td :title="game.team2">{{ game.team2 }}</td>
          <td :title="game.dutyTeam">{{ game.dutyTeam }}</td>
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
    }
  }    
};