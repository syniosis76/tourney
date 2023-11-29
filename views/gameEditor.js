export const gameEditor = {
  template: `
<div id="gameEditor" class="modalbackground">
  <div class="modalpopup card">
    <div v-if="game" class="flexcolumn">      
      <template v-if="tournament.canEdit">
        <div class="flexrow">        
          <input v-model="editGame.group" class="gameinputshort"/><div class="flexend"><svg v-on:click="refresh" class="darkrefreshbutton"><use xlink:href="/html/icons.svg/#refresh"></use></svg></div>
        </div>
        <div class="flexrow">
          <input v-model="editGame.team1" class="gameinput"/>
          &nbsp;
          <input v-model="editGame.team1Score" type="number" class="scoreinput"/>
          &nbsp;          
          <button class="radiobutton" :class="{ selectedbackground: editGame.team1Defaulted }" v-on:click="editGame.team1Defaulted = !editGame.team1Defaulted">Defaulted</button>
        </div>
        <div class="flexrow">
          <input v-model="editGame.team2" class="gameinput"/>
          &nbsp;
          <input v-model="editGame.team2Score" type="number" class="scoreinput"/>    
          &nbsp;
          <button class="radiobutton" :class="{ selectedbackground: editGame.team2Defaulted }" v-on:click="editGame.team2Defaulted = !editGame.team2Defaulted">Defaulted</button>
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
          <div>{{ editGame.group }}</div><div class="flexend"><svg v-on:click="refresh" class="darkrefreshbutton"><use xlink:href="/html/icons.svg/#refresh"></use></svg></div>
        </div>
        <div class="flexrow">
          <div>{{ editGame.team1 }}</div><div class="flexend" :class="{ scoreactive: editGame.status === 'active', scorewin: editGame.status === 'complete' && editGame.team1Score > editGame.team2Score, scoredraw: editGame.status === 'complete' && editGame.team1Score === editGame.team2Score, scorelose: editGame.status === 'complete' && game.team1Score < editGame.team2Score }"><b>{{ editGame.team1Score }}</b></div>
        </div>
        <div class="flexrow">
          <div>{{ editGame.team2 }}</div><div class="flexend" :class="{ scoreactive: editGame.status === 'active', scorewin: editGame.status === 'complete' && editGame.team2Score > editGame.team1Score, scoredraw: editGame.status === 'complete' && editGame.team2Score === editGame.team1Score, scorelose: editGame.status === 'complete' && editGame.team2Score < editGame.team1Score }"><b>{{ editGame.team2Score }}</b></div>
        </div>
      </template>
      <br/>
      <div class="flexrow">
        <textarea v-model="eventLog" placeholder="Events" style="width: 300px; height: 150px;"/>
      </div>  
      <br/>
      <div v-if="tournament.canEdit" class="flexrow flexright">
        <div style="font-size: 12px">{{ historyTime }}</div>
        &nbsp;&nbsp;
        <a v-on:click="showHistory(1)" title="Next Revision">&lt;</a>
        &nbsp;&nbsp;
        <a v-on:click="restoreHistory" title="Restore Events">R</a>
        &nbsp;&nbsp;
        <a v-on:click="showHistory(-1)" title="Previous Revision">&gt;</a>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <a v-on:click="save">Save</a>
        &nbsp;&nbsp;
        <a v-on:click="cancel">Cancel</a>
      </div>
      <div v-else class="flexrow flexright">        
        <div>
          <template v-if="editGame.status === 'pending'">Pending</template>
          <template v-if="editGame.status === 'active'">Active</template>
          <template v-if="editGame.status === 'complete'">Complete</template>
        </div>  
        <a v-on:click="cancel" class="flexend">Close</a>
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
      eventLog: "",
      historyTime: null,
      historyVersion: 0
    }
  },
  created () {   
    this.load(); 
    this.editGame = JSON.parse(JSON.stringify(this.game));
  },
  methods:
  {    
    refresh: function() {
      this.load();
      this.editGame = JSON.parse(JSON.stringify(this.game));
    },
    load: function() {
      var _this = this
      oboe({
          method: 'GET',
          url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/game/' + _this.game.id.value,          
          headers: _this.$googleUser.headers
      })
      .done(function(game)
      {
        _this.assignGame(_this.game, game);
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
    removeEditor: function() {      
      this.$.appContext.app.unmount();
    },
    assignGame: function(target, source) {
      target.group = source.group
      target.team1 = source.team1
      target.team1Score = source.team1Score
      target.team1Defaulted = source.team1Defaulted
      target.team2 = source.team2
      target.team2Score = source.team2Score
      target.team2Defaulted = source.team2Defaulted
      target.dutyTeam = source.dutyTeam
      target.status = source.status
      if (source.eventLog) {
        target.eventLog = source.eventLog
      } 

    },
    putGame: function() {    
      var _this = this
      if (_this.pitch != undefined)
      {       
        var editGame = _this.editGame;
        var game = _this.game;

        console.log('Update game ', game.id.value);

        this.assignGame(game, editGame);

        var data = { "group": editGame.group,
          "team1": editGame.team1,
          "team1Score": editGame.team1Score,
          "team1Defaulted": editGame.team1Defaulted,
          "team2": editGame.team2,
          "team2Score": editGame.team2Score,
          "team2Defaulted": editGame.team2Defaulted,
          "dutyTeam": editGame.dutyTeam,
          "status": editGame.status
        };

        oboe({
            method: 'PUT',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/game/' + game.id.value,
            body: data,
            headers: _this.$googleUser.headers
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
    },
    getHistory: function (historyVersion) {
      var _this = this
      oboe({
          method: 'GET',
          url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/game/' + _this.game.id.value + '/history/' + historyVersion,          
          headers: _this.$googleUser.headers
      })
      .done(function(gameHistory)
      {
        _this.historyTime = gameHistory.time
        _this.assignGame(_this.game, gameHistory.game);
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
    showHistory: function (offset) {
        this.historyVersion = Math.max(this.historyVersion + offset, 0)
        this.getHistory(this.historyVersion)
    },
    restoreHistory: function () {
      var _this = this
      if (_this.pitch != undefined)
      {       
        var editGame = _this.editGame;
        var game = _this.game;

        console.log('Restore game revision ', game.id.value, 'version', this.historyVersion);

        oboe({
            method: 'PUT',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value + '/game/' + game.id.value + '/history/' + this.historyVersion,
            headers: _this.$googleUser.headers
        })
        .done(function(tournament)
        {
          _this.refresh();
          _this.historyVersion = 0;
          _this.historyTime = null;
        })
        .fail(function (error) {
          console.log(error);       
          alert('Unable to restore game revision');
        });        
      }
    }
  }    
};