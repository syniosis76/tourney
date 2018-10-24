export const login = {
  template: `
<div class="mainmargin">
  <template v-if="$googleUser.isSignedIn">
    <p>Signed in as {{ $googleUser.googleUserDescription }}.</p>
    <p><a v-on:click="signOut();">Sign Out</a></p>
  </template>
  <template v-else>
    <p><a v-on:click="signIn();">Sign In</a></p>
  </template>
</div>
`,     
  data () {
    return {
      loading: false,
      version: 'Loading...'
    }
  },
  created () {

  },
  mounted() {
 
  },
  watch: {
    
  },
  methods:
  {
    refresh: function() {
      this.forceUpdate();
    },
    signIn: function () {
      var _this = this;
      var auth2 = window.gapi.auth2.getAuthInstance();
      auth2.signIn().then(function () {
        console.log('User signed in.');
        _this.checkGoogleUser();
      });
    },
    signOut: function () {
      var _this = this;
      var auth2 = window.gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        console.log('User signed out.');
        _this.checkGoogleUser();
      });
    },
    checkGoogleUser: function() {
      var _this = this;      
      var wasSignedIn = _this.$googleUser && _this.$googleUser.isSignedIn;
      if (!wasSignedIn) {
        window.setTimeout(function() {
          if (_this.$googleUser && _this.$googleUser.isSignedIn) _this.refresh();
          else _this.checkGoogleUser();
        }, 300);
      }      
    },
  }    
};

