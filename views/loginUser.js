export const loginUser = {
  template: `
<div style="margin-left: 8px;">
  <router-link tag="a" to="/login">
    <svg class="headerbutton" :class="{ selectedfill: isSignedIn }"><use xlink:href="/html/icons.svg/#account"></use></svg>
  </router-link>
</div>
`,     
  data () {
    return {
      googleUser: this.$googleUser,
      isSignedIn: false
    }
  },
  created () {

  },
  mounted () {
    if (this.googleUser.status == 'pending') {
      this.waitForGoogleUser();
    }
    else {
      this.refresh();
    }
  },
  methods:
  {    
    refresh: function() {
      this.isSignedIn = 'false';
      this.isSignedIn = this.googleUser.isSignedIn;
    },
    waitForGoogleUser: function() {
      if (!this.googleUser.isSignedIn) {
        this.googleUser.checkGoogleUser(this.onGoogleUserCheckComplete);
      }
    },
    onGoogleUserCheckComplete: function() {
      console.log('Login Check Complete', this.googleUser.status);
      this.isSignedIn = this.googleUser.isSignedIn;
    },
  }    
};