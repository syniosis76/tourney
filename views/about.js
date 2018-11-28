export const about = {
  template: `
<div class="mainmargin">
  <div>Version {{ version }}</div>
  <p>
    © 2018 Stacey Verner
  </p>
  <p>
    <router-link to="/tournaments">Tournaments</router-link>  
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
    this.getVersion()
  },
  watch: {
    // call again the method if the route changes
    "$route": "getVersion('name')"
  },
  methods:
  {
    getVersion: function(url)
    {
      var _this = this
      _this.loading = true
      _this.version = 'Loading...'

      oboe('/about')
      .done(function(data)
      {
        console.log(data);
        _this.version = data.version;
      })
      .fail(function (error) {
        console.log(error);
        _this.version = 'Error!';
      });
    }
  }    
};

