export const gameEditor = {
  template: `
<div id="gameEditor" class="modalbackground">
  <div class="modalpopup card">
    <div v-if="game" class="flexcolumn">      
      <template v-if="tournament.canEdit">
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
      </template>
      <template v-else>
        <div class="flexrow">        
          Group:&nbsp;<b>{{ editGame.group }}</b>
        </div>
        <div class="flexrow">
          Team 1:&nbsp;<b>{{ editGame.team1 }}:&nbsp;&nbsp;{{ editGame.team1Score }}</b>
        </div>
        <div class="flexrow">
          Team 2:&nbsp;<b>{{ editGame.team2 }}:&nbsp;&nbsp;{{ editGame.team2Score }}</b>
        </div>
        <div class="flexrow">
          Duty:&nbsp;{{ editGame.dutyTeam }}
        </div>        
        <div class="flexrow">
          Status:&nbsp; 
          <template v-if="editGame.status === 'pending'">Pending</template>
          <template v-if="editGame.status === 'active'">Active</template>
          <template v-if="editGame.status === 'complete'">Complete</template>
        </div>  
      </template>
      <br/>
      <div class="flexrow">
        <textarea v-model="eventLog" placeholder="Events" style="width: 300px; height: 150px;"/>
      </div>  
      <br/>
      <div v-if="tournament.canEdit" class="flexrow flexright">
        <a v-on:click="save">Save</a>
        &nbsp;&nbsp;
        <a v-on:click="cancel">Cancel</a>
      </div>
      <div v-else class="flexrow flexright">        
        <a v-on:click="cancel">Close</a>
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
      editGame: {},
      eventLog: ""
    }
  },
  created () {   
    this.load(); 
    this.editGame = JSON.parse(JSON.stringify(this.game));
  },
  methods:
  {
    refresh: function() {
      app.__vue__.$children.forEach(function(item) {
        if (item.refresh) {
          item.refresh();
        }
      });
    },
    load: function() {
      var _this = this
      oboe({
          method: 'GET',
          url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/game/' + _this.game.id.value,          
          headers: this.$googleUser.headers
      })
      .done(function(game)
      {
        _this.game = game;
        _this.editGame = JSON.parse(JSON.stringify(_this.game));
        var eventLog = ""
        _this.game.eventLog.forEach(item => {
            if (item && item.eventType && (item.team || item.eventType.includes('Period'))) {              
              eventLog = eventLog + item.time.substring(11, 16) + " " + item.eventType + (item.player ? " #" + item.player : "") + (item.team ? " " + item.team : "") + "\n";
            };
        });
        _this.eventLog = eventLog
      })
      .fail(function (error) {
        console.log(error);     
      }); 
    },    
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
          _this.refresh();
        })
        .fail(function (error) {
          console.log(error);       
          alert('Unable to save game');
        });        
      }
    }
  }    
};