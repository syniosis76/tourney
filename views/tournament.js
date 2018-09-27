export const tournament = {
  template: `
<div>
  <div v-if="tournament">    
    <h1>{{ tournament.name }}</h1>
    <p v-if="tournament.startDate">{{ tournament.startDate.value | formatDate }}</p>  
    <router-link :to="'/tournament/edit/' + tournament.id.value">Edit</router-link>
  </div>
  <div v-else>
    <p>Tournament not found.</p>  
    <router-link to="/tournaments">Tournaments</router-link>
  </div>
  <p>  
    <router-link to="/about">About</router-link>
  </p>
</div>
`,
  data () {
    return {
      loading: false,
      tournament: undefined
    }
  },
  created () {
    this.getTournament(this.$route.params.id)
  },
  //watch: {
  //  "$route": "getTournament($route.params.id)"
  //},
  methods:
  {
    getTournament: function(id)
    {
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
    }
  }    
};