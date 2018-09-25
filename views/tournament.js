export const tournament = {
  template: `
<div>
  <div v-if="typeof tournament == 'undefined'">
    <p>Tournament not found.</p>  
    <router-link to="/tournaments">Tournaments</router-link>
  </div>
  <div v-else>
    <h1>{{ tournament.name }}</h1>
    <p>{{ tournament.startDate.value | formatDate }}</p>  
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
  watch: {
    "$route": "getTournament($route.params.id)"
  },
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
        _this.tournament = 'Error!';
        _this.loading = false
      });
    }
  }    
};