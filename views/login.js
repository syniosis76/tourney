export const login = {
  template: `
<div class="mainmargin">
  <h2>Sign in with Google</h2>
  <p>If you have permission to manage a tournament you'll first need to sign in with your google account.</p>
  <template v-if="displayStatus == 'pending'">
    <p>Checking authentication ...</p>
  </template>
  <template v-else-if="googleUser.isSignedIn">
    <p>You are signed in as <b>{{ googleUser.description }}</b>.</p>
    <p><a v-on:click="signOut();">Sign Out</a></p>
  </template>
  <template v-else>    
    <p><a v-on:click="signIn();">Sign In</a></p>
    <p v-if="googleUser.error">{{ googleUser.error }}</p>
    <p>You'll see a google popup and be asked to login.</p>    
  </template>
  <div v-show="displayStatus == 'pending' || !googleUser.isSignedIn" style="display: flex; justify-content: flex-start;">
    <div>If you are having trouble signing in try this:</div>
    &nbsp;
    <div id="buttonDiv"></div>
  </div>
  <p><a href="javascript:history.back()">Back</a></p>  
</div>
`,     
  data () {
    return {
      googleUser: this.$googleUser,
      displayStatus: 'pending'
    }
  },
  created () {

  },
  mounted () {
    this.googleUser.callback = this.waitForGoogleUser;
    this.showGoogleButton();
    if (this.googleUser.status == 'pending') {
      this.waitForGoogleUser();
    }
    else {
      this.refresh();
    }
  },
  watch: {
    
  },
  methods:
  {
    refresh: function() {
      this.displayStatus = 'pending';
      this.displayStatus = this.googleUser.status;
    },
    signIn: function () {
      this.displayStatus = 'pending';
      this.googleUser.signIn();
      this.waitForGoogleUser();      
    },
    signOut: function () {
      this.googleUser.signOut();
      window.RefreshChildren();
    },
    waitForGoogleUser: function() {
      if (!this.googleUser.isSignedIn) {
        this.googleUser.checkGoogleUser(this.onGoogleUserCheckComplete);
      }
    },
    onGoogleUserCheckComplete: function() {
      //console.log('Login Check Complete', this.googleUser.status);      
      this.displayStatus = this.googleUser.status;
      window.RefreshChildren();
    },
    showGoogleButton: function() {
      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "small", text: "signin", width: "80px"} // Customize the button
      );
    }
  }    
};

