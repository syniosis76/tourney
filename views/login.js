export const login = {
  template: `
<div class="mainmargin">
  <div>Login</div>
  <p>
    <a v-on:click="signIn();">Sign In</a>
  </p>
  <p>
    <a v-on:click="signOut();">Sign Out</a>
  </p>
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
    signIn: function () {
      var auth2 = window.gapi.auth2.getAuthInstance();
      auth2.signIn().then(function () {
        console.log('User signed in.');
      });
    },
    signOut: function () {
      var auth2 = window.gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        console.log('User signed out.');
      });
    }
  }    
};

