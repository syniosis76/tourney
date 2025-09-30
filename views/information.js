export const information = {
  template: `
<div class="mainmargin">
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  <div v-else-if="tournament" class="flexcolumn">     
    <div v-if="tournament" class="flexcolumn">    
      <toolbar :tournament="tournament"></toolbar>
    </div>
    <p>
      <div style="white-space: pre-wrap;">{{ tournament.info }}</div>
    </p>   
  </div>
  <div v-else>
    <p>Oops. Something went wrong.</p>  
    <router-link to="/tournaments">Tournaments</router-link>
  </div>
</div>
  `,
  data () {
    return {
      loading: false,
      tournament: undefined,
      googleUser: this.$googleUser
    }
  },
  created () {    
    this.refresh();
  },
  mounted() {
    this.waitForGoogleUser();
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
    getTournament: function(id)
    {
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
        console.log('Loaded info for ' + id);        
        _this.tournament = tournament;
        _this.loading = false;
      })
      .fail(function (error) {
        console.log(error);        
        _this.loading = false;
      });
    }
  }   
};