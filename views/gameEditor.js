export const gameEditor = {
  template: `
<div id="gameEditor" class="modalbackground">
  <div class="modalpopup card">
    <div v-if="game" class="flexcolumn">      
      <div class="flexrow">        
        <input v-model="editGame.group" class="gameinputshort"/>
      </div>
      <div class="flexrow">
        <input v-model="editGame.team1" class="gameinput"/>
        &nbsp;
        <input v-model="editGame.team1Score" type="number" class="scoreinput"/>
      </div>
      <div class="flexrow">
        <input v-model="editGame.team2" class="gameinput"/>
        &nbsp;
        <input v-model="editGame.team2Score" type="number" class="scoreinput"/>    
      </div>
      <div class="flexrow">        
        <input v-model="editGame.dutyTeam" class="gameinput"/>
      </div>
      <div class="flexrow">        
        <button class="radiobutton" :class="{ selectedbackground: editGame.status === 'pending' }" v-on:click="editGame.status = 'pending'">Pending</button>
        &nbsp;
        <button class="radiobutton" :class="{ selectedbackground: editGame.status === 'active' }" v-on:click="editGame.status = 'active'">Active</button>
        &nbsp;
        <button class="radiobutton" :class="{ selectedbackground: editGame.status === 'complete' }" v-on:click="editGame.status = 'complete'">Complete</button>
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
      editGame: {}
    }
  },
  created () {    
    this.editGame = JSON.parse(JSON.stringify(this.game));
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
        var editGame = _this.editGame;
        var game = _this.game;

        console.log('Update game ', game.id.value);

        game.group = editGame.group
        game.team1 = editGame.team1
        game.team1Score = editGame.team1Score
        game.team2 = editGame.team2
        game.team2Score = editGame.team2Score
        game.dutyTeam = editGame.dutyTeam
        game.status = editGame.status        

        var data = { "group": editGame.group,
          "team1": editGame.team1,
          "team1Score": editGame.team1Score,
          "team2": editGame.team2,
          "team2Score": editGame.team2Score,
          "dutyTeam": editGame.dutyTeam,
          "status": editGame.status
        };

        oboe({
            method: 'PUT',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/game/' + game.id.value,
            body: data,
            headers: this.$googleUser.headers
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