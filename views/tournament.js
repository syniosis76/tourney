export const tournament = {
  template: `
<div class="nomargin">
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  <div v-if="tournament" class="flexcolumn">  
    <toolbar :tournament="tournament"></toolbar>
  </div>
  <div v-if="tournament">
    <template v-if="tournament.gameDates" class="flexcolumn">
      <template v-for="gameDate in tournament.gameDates">
        <gameDate :tournament="tournament" :gameDate="gameDate"></gameDate>                
      </template>
    </template>
    <div class="footerspacer"></div>    
  </div>
  <div v-if="!tournament && !loading">
    <p>Oops. Something went wrong.</p>  
    <router-link to="/tournaments">Tournaments</router-link>
  </div>
</div>
  `,
  data () {
    return {
      loading: false,
      tournament: undefined,
      tournamentBanner: undefined,
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
    loadData: function() {
      this.getTournament(this.$route.params.id)      
    },
    refresh: function() {
      this.loadData();
    },
    waitForGoogleUser: function() {
      if (!this.googleUser.isSignedIn) {
        this.googleUser.checkGoogleUser(this.onGoogleUserCheckComplete);
      }
    },
    onGoogleUserCheckComplete: function() {
      if (this.googleUser.isSignedIn) {
        this.loadData();
      }  
    },
    getTournament: function(id)
    {
      var _this = this
      _this.loading = true

      oboe({
        method: 'GET',
        url: '/data/tournament/' + id,
        headers: this.$googleUser.headers
      })      
      .done(function(tournament)
      {
        console.log('Loaded tournament ' + tournament.id.value);        
        _this.tournament = tournament;        
        _this.loading = false;
        _this.getBanner(id);
      })
      .fail(function (error) {
        console.log(error);        
        _this.loading = false;
      });
    },
    getBanner: function(id)
    {
      var _this = this
      
      //var url = 'https://cdn.jsdelivr.net/gh/syniosis76/tourney-banners@main/' + id + '.png';
      var url = 'https://raw.githubusercontent.com/syniosis76/tourney-banners/main/' + id + '.png';

      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);      
      xhr.responseType = 'arraybuffer';
      xhr.onerror = function(e) { alert('error'); };
      xhr.onload = function(e) {
        if (this.status == 200) {          
          var uInt8Array = new Uint8Array(this.response);
          var i = uInt8Array.length;
          var biStr = new Array(i);
          while (i--) {
            biStr[i] = String.fromCharCode(uInt8Array[i]);
          }
          var data = biStr.join('');
          var base64 = window.btoa(data);                  

          _this.tournamentBanner = base64;
        }
      };
      xhr.send();
    },
    deleteTournament: function()
    {      
      var _this = this
      if (_this.tournament != undefined)
      {
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
          _this.refresh()
        })
        .fail(function (error) {
          console.log(error);        
          alert('Unable to add Date.')
        });
      }
    }
  }   
};