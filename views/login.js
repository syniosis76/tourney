export const login = {
  template: `
<div class="mainmargin">
  <h1>Sign in with Google</h1>
  <p>If you have permission to manage a tournament you'll first need to sign in with your google account.</p>
  <template v-if="googleUser.status == 'pending'">    
    <p>We're checking if you are already logged in...</p>
  </template>
  <template v-else-if="googleUser.isSignedIn">
    <p>You are signed in as <b>{{ googleUser.description }}</b>.</p>
    <p><a v-on:click="signOut();">Sign Out</a></p>
  </template>
  <template v-else>    
    <p><a v-on:click="signIn();">Sign In</a></p>
    <p>You'll see a google popup and be asked to login.</p>
  </template>
  <p><a href="javascript:history.back()">Back</a></p>
</div>
`,     
  data () {
    return {
      googleUser: this.$googleUser
    }
  },
  created () {

  },
  watch: {
    
  },
  methods:
  {
    signIn: function () {
      this.googleUser.signIn()
    },
    signOut: function () {
      this.googleUser.signOut()
    },
  }    
};

