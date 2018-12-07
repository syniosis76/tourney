export const gameEditor = {
  template: `
<div id="gameEditor" class="modalbackground">
  <div class="modalpopup card">
    <div v-if="game" class="flexcolumn">      
      <div class="flexrow">        
        <input v-model="game.group" class="gameinputshort"/>
      </div>
      <div class="flexrow">
        <input v-model="game.team1" class="gameinput"/>
        &nbsp;
        <input v-model="game.team1Score" type="number" class="scoreinput"/>
      </div>
      <div class="flexrow">
        <input v-model="game.team2" class="gameinput"/>
        &nbsp;
        <input v-model="game.team2Score" type="number" class="scoreinput"/>    
      </div>
      <div class="flexrow">        
        <input v-model="game.dutyTeam" class="gameinput"/>
      </div>
      <div class="flexrow">        
        <button class="radiobutton" v-on:click="game.status = 'pending'">Pending</button>
        &nbsp;
        <button class="radiobutton" v-on:click="game.status = 'active'">Active</button>
        &nbsp;
        <button class="radiobutton" v-on:click="game.status = 'complete'">Complete</button>
      </div>
      <br/>
      <div class="flexrow flexright">
        <a v-on:click="save">Save</a>
        &nbsp;&nbsp;
        <a v-on:click="cancel">Cancel</a>
      </div>
    </div>
    <div v-else>
      <p>Game not found.</p>      
    </div>
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
    save: function() {
      this.removeEditor();
      this.putGame();
    },
    cancel: function() {
      this.removeEditor()
    },
    removeEditor() {      
      var element = document.getElementById('gameEditor');
      element.parentNode.removeChild(element);
    },
    putGame: function()
    {    
      var _this = this
      if (_this.pitch != undefined)
      {        
        var game = _this.game

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
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/game/' + game.id.value,
            body: data
        })
        .done(function(tournament)
        {
          
        })
        .fail(function (error) {
          console.log(error);        
          alert('Unable to save game')
        });        
      }
    }
  }    
};