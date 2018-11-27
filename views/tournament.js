export const tournament = {
  template: `
<div class="mainmargin">
  <div v-if="loading" class="flexcolumn">
    Loading...
  </div>
  <div v-else-if="tournament" class="flexcolumn">    
    <div class="flexrow">
      <div class="tournamentheader fixedleft">  
        <h1>{{ tournament.name }}</h1>
        <div class="flexrow flexcenter menurow">                                
          <svg class="selected-button"><use xlink:href="/html/icons.svg/#list"></use></svg>
          &nbsp;
          <router-link :to="'/statistics/' + tournament.id.value"><svg class="link-button"><use xlink:href="/html/icons.svg/#trophy"></use></svg></router-link>
          &nbsp;
          <router-link :to="'/information/' + tournament.id.value"><svg class="link-button"><use xlink:href="/html/icons.svg/#info"></use></svg></router-link>
          &nbsp;
          <input v-model="tournament.searchText" placeholder="search" style="width: 100px"/>
          &nbsp;
          <svg v-on:click="loadData(false)" class="refresh-button"><use xlink:href="/html/icons.svg/#refresh"></use></svg>
          <div v-if="tournament.canEdit" class="dropdown">          
            <svg onclick="showDropdown(event, 'tournamentDropdown')" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>
            <div id="tournamentDropdown" class="dropdown-content">              
              <router-link :to="'/tournament/' + tournament.id.value + '/edit'">Edit Tournament Details</router-link>
              <a v-on:click="deleteTournament">Delete Tournament</a>
              <a v-on:click="addDate">Add Date</a>              
            </div>
          </div>
        </div>
      </div>
    </div>    
    <template v-if="tournament.gameDates" class="flexcolumn">
      <template v-for="gameDate in tournament.gameDates.data">
        <gameDate :tournament="tournament" :gameDate="gameDate"></gameDate>                
      </template>
    </template>
    <div class="endspacer"></div>    
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
      googleUser: this.$googleUser,
    }
  },
  created () {    
    this.loadData(false);  
  },
  mounted() {
    this.waitForGoogleUser();
  },
  methods:
  {    
    loadData: function(refresh) {
      this.getTournament(this.$route.params.id, refresh)
    },
    refresh: function() {
      this.loadData(true);
    },
    waitForGoogleUser: function() {
      if (!this.googleUser.isSignedIn) {
        this.googleUser.checkGoogleUser(this.onGoogleUserCheckComplete);
      }
    },
    onGoogleUserCheckComplete: function() {
      if (this.googleUser.isSignedIn) {
        this.loadData(true);
      }  
    },
    getTournament: function(id, refresh)
    {
      var _this = this
      if (!refresh) {
        _this.loading = true
        _this.tournament = undefined
      }

      oboe({
        method: 'GET',
        url: '/data/tournament/' + id,                    
        headers: this.$googleUser.headers
      })      
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
        gapi.auth2.init()
        var auth2 = window.gapi.auth2.getAuthInstance();
        if (auth2.isSignedIn.get()) {
          console.log('Is Logged In');
        }
        if (confirm("Are you sure you want to delete " + _this.tournament.name + "?")) {
          console.log('Delete', _this.tournament.name)
          oboe({
              method: 'DELETE',
              url: '/data/tournament/' + _this.tournament.id.value,
              headers: this.$googleUser.headers                
          })
          .done(function(tournament)
          {
            _this.$router.push('/')
          })
          .fail(function (error) {
            console.log(error);        
            alert('Unable to delete.')
          });
        };
      }
    },
    addDate: function()
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        console.log('Add Date for', _this.tournament.name)
        oboe({
          method: 'PUT',
          url: '/data/tournament/' + _this.tournament.id.value + '/adddate',
          headers: this.$googleUser.headers                  
        })
        .done(function(tournament)
        {
          _this.getTournament(_this.tournament.id.value)
        })
        .fail(function (error) {
          console.log(error);        
          alert('Unable to add Date.')
        });
      }
    }
  }   
};