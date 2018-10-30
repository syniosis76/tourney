export const login = {
  template: `
<div class="mainmargin">
  <template v-if="$googleUser.status == 'pending'">
    <p>Loading...</p>
  </template>
  <template v-else-if="$googleUser.isSignedIn">
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
      this.$googleUser.checkGoogleUser(this.refresh);
  },
  watch: {
    
  },
  methods:
  {
    refresh: function() {
      console.log('refresh');
      this.$forceUpdate();
    },
    signIn: function () {
      this.$googleUser.signIn(this.refresh)
    },
    signOut: function () {
      this.$googleUser.signOut(this.refresh)
    },
  }    
};

