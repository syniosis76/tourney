export const loginUser = {
  template: `
<div style="margin-left: 8px;">
  <router-link tag="a" to="/login">
    <template v-if="googleUser.status == 'pending'">
      <p>...</p>
    </template>  
    <template v-else-if="googleUser.isSignedIn">
        <p>{{ googleUser.shortDescription }}</p> 
    </template>
    <template v-else>
      <p>Sign In</p>
    </template>  
  </router-link>
</div>
`,     
  data () {
    return {
      googleUser: this.$googleUser 
    }
  },
  created () {

  },
  methods:
  {

  }    
};