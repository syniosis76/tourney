export const scoreEditor = {
  template: `
<div id="inlinescoreEditor" class="inlinescoreEditor card">
  <div v-if="game" class="flexrow">    
    <div>{{ game.team1 }}</div>
    <input v-model="game.team1Score" type="number" class="scoreinput"/>
    <div>{{ game.team2 }}</div>
    <input v-model="game.team2Score" type="number" class="scoreinput"/>    
    <a v-on:click="putGame">Apply</a>
  </div>
  <div v-else>
    <p>Game not found.</p>      
  </div>
</div>
`,
  props: ['tournament', 'gameDate', 'pitch', 'game'],
  data () {
    return {
      loading: false,
    }
  },
  created () {
    
  },
  methods:
  {
    putGame: function()
    {
      // Remove the editor
      var element = document.getElementById('inlinescoreEditor');
      element.parentNode.removeChild(element);

      // Save the change.
      var _this = this
      if (_this.pitch != undefined)
      {
        console.log('Update game ', _this.game.id.value);
        if (_this.game.status === "pending") _this.game.status = "scoreset";
        var data = { "team1Score": _this.game.team1Score,
          "team2Score": _this.game.team2Score,
          "status": _this.game.status
        };
        oboe({
            method: 'PUT',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/game/' + _this.game.id.value,
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
      }
    }
  }    
};