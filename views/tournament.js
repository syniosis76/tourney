export const tournament = {
  template: `
<div class="mainroute">
  <div v-if="tournament">    
    <div class="largetext">{{ tournament.name }}</div>
    <div>
      <span v-if="tournament.startDate">{{ tournament.startDate.value | formatDate }}</span>
      <span v-if="tournament.endDate"> to {{ tournament.endDate.value | formatDate }}</span>
    </div>
    <div>
      <router-link :to="'/tournament/edit/' + tournament.id.value">Edit</router-link>
      |
      <a v-on:click="deleteTournament">Delete</a>
  </div>
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
      tournament: undefined
    }
  },
  created () {
    this.getTournament(this.$route.params.id)
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
        _this.loading = false
      });
    },
    deleteTournament: function()
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        console.log('Delete ', _this.tournament.name)
        oboe({
          method: 'DELETE',
          url: '/data/tournament/' + _this.tournament.id.value,                    
      })
      .done(function(tournament)
      {
        _this.$router.push('/')
      })
      .fail(function (error) {
        console.log(error);        
        alert('Unable to delete.')
      });
      }
    }
  }    
};