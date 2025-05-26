export const players = {
  template: `
<div class="editmargin">
  <div v-if="loading" class="flexcolumn">
    Loading...
  </div>
  <div v-else-if="tournament">    
    <h2>{{tournament.name}}</h2>
    <p><a v-on:click="pastePlayers" class="flexend">Paste Players</a></p>
    <p>Format: Grade Team Number Name</p>
    <p>Example: OA Sharks 1 Max Venturi</p>    
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
      newAdministrator: ''
    }
  },  
  created () {
    this.getTournament(this.$route.params.id)
  },
  methods:
  {    
    refresh: function() {
    
    },
    getTournament: function(id) {
      var _this = this
      _this.loading = true
      _this.tournament = undefined

      oboe('/data/tournament/' + id)      
      .done(function(tournament)
      {
        console.log('Loaded tournament ' + tournament.id.value);        
        _this.tournament = tournament
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
      })
      .catch(error => {
        alert('Error reading from the clipboard:\n  ' + error.message + '\nCheck the site settings from the url bar.');
      }); 
    },
  }    
};