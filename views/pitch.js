export const pitch = {
  template: `
<div>
  <p>Tournament Pitch.</p>  
  <p>{{ tournamentId }}</p>
</div>
`,
  props: ['tournamentId'],
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
    }
  }    
};