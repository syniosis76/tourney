export const loginUser = {
  template: `
<div style="margin-left: 8px;">
  <router-link tag="a" to="/login">
    <svg class="headerbutton" :class="{ selectedfill: googleUser.isSignedIn }"><use xlink:href="/html/icons.svg/#account"></use></svg>
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