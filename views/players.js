export const players = {
  template: `
<div class="mainmargin">
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  <div v-else-if="tournament">    
    <div v-if="tournament" class="flexcolumn">    
      <toolbar :tournament="tournament"></toolbar>
    </div>
    <br/>
    <h3>Players</h3>  
    <p>
        <select id="gradeList" name="gradeList" v-model="grade" @change="loadPlayers()">
          <template v-for="grade in grades">    
            <option :value="grade">{{grade}}</option>
          </template>
        </select>
        <select id="teamList" name="teamList" v-model="team" @change="loadPlayers()">
          <template v-for="team in teams">    
            <option :value="team">{{team}}</option>
          </template>
        </select>
    </p>    
    <div v-if="team">
      <table id="players" class="selectable">
        <thead>
          <tr>
            <th>Group</th>
            <th>Team</th>
            <th>#</th>    
            <th>Name</th>                      
            <td v-if="tournament.canEdit"></td>
          </tr>
        </thead>
        <tbody>          
          <template v-for="player in players">                                          
            <tr>
              <td>{{ player.grade }}</td>
              <td>{{ player.team }}</td>
              <td>{{ player.number }}</td>
              <td>{{ player.player }}</td>
            </tr>
          </template> 
        </tbody>    
      </table>
      <p><a v-on:click="deleteTeamPlayers" class="flexend">Delete players for {{grade}} {{team}}</a></p>
    </div>
    <div v-else>
      <p>Select a team or add players.</p>    
    </div>
    <h3>Add Players</h3>        
    <p>Add players by pasting from a spreadsheet with: Grade Team Number Name</p>    
    <p>
        Example:
        <br/>
        OA Sharks 1 Max Venturi
        <br/>
        OA Sharks 2 Blake Rider
    </p>
    <p><a v-on:click="pastePlayers" class="flexend">Paste Players</a></p>
  </div>
  <div v-else>
    <p>Tournament not found.</p>  
    <router-link to="/tournaments">Tournaments</router-link>
  </div>
</div>
`,
  data () {
    return {
      loading: false,
      tournament: undefined,
      newAdministrator: '',
      grades: [],
      grade: '',
      teams: [],
      team: '',
      players: [],
      googleUser: this.$googleUser
    }
  },  
  created () {
    this.getTournament(this.$route.params.id)
  },
  methods:
  {    
    refresh: function() {
      this.getTournament(this.$route.params.id)
    },
    waitForGoogleUser: function() {
      if (!this.googleUser.isSignedIn) {
        this.googleUser.checkGoogleUser(this.onGoogleUserCheckComplete);
      }
    },
    onGoogleUserCheckComplete: function() {
      if (this.googleUser.isSignedIn) {
        this.refresh();
      }  
    },
    loadPlayers: function() {
      var _this = this;
      const players = this.tournament.players;
      this.grades = [...new Set(players.map(player => player.grade))];
      this.grades.sort();
      if ((this.grade === '' || !this.grades.includes(this.grade)) && this.grades.length > 0)
      {
        this.grade = this.grades[0];
      };

      const gradePlayers = players.filter(function(player) {
        return player.grade === _this.grade;
      });

      this.teams = [...new Set(gradePlayers.map(player => player.team))];
      this.teams.sort();
      if ((this.team === '' || !this.teams.includes(this.team)) && this.teams.length > 0)
      {
        this.team = this.teams[0];
      };

      this.players = gradePlayers.filter(function(player) {
        return player.team === _this.team;
      });
    },
    getTournament: function(id) {
      var _this = this
      _this.loading = true
      _this.tournament = undefined

      oboe({
        method: 'GET',
        url: '/data/tournament/' + id,
        headers: this.$googleUser.headers
      })      
      .done(function(tournament)
      {
        console.log('Loaded tournament ' + tournament.id.value);        
        _this.tournament = tournament
        _this.loadPlayers()
        _this.loading = false
      })
      .fail(function (error) {
        console.log(error);        
        _this.loading = false
      });
    },
    sendData: function(route, data, refresh) {
      var _this = this
      if (_this.tournament != undefined)
      {
        oboe({
            method: 'PUT',
            url: '/data/tournament/' + _this.tournament.id.value + '/' + route,
            body: data
        })
        .done(function(tournament)
        {
          if (refresh)
          {
            _this.refresh();
          }
        })
        .fail(function (error) {
          console.log(error);        
          alert('Oops. Something went wrong.');
        });      
      }
    },
    pastePlayers: function() {
      navigator.clipboard.readText()
      .then(clipboardText => {          
        var data = { 'mode': 'replace', 'clipboardText': clipboardText };
        this.sendData('players', data, true);
        alert('Players Added');
      })
      .catch(error => {
        alert('Error reading from the clipboard:\n  ' + error.message + '\nCheck the site settings from the url bar.');
      }); 
    },
    deleteTeamPlayers: function() {
      var data = { 'grade': this.grade, 'team': this.team };
      this.sendData('playersDeleteTeam', data, true);      
    },
  }    
};