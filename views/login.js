export const login = {
  template: `
<div class="mainmargin">
  <template v-if="googleUser.status == 'pending'">
    <p>Loading...</p>
  </template>
  <template v-else-if="googleUser.isSignedIn">
    <p>Signed in as {{ googleUser.description }}.</p>
    <p><a v-on:click="signOut();">Sign Out</a></p>
  </template>
  <template v-else>
    <p><a v-on:click="signIn();">Sign In</a></p>
  </template>
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

