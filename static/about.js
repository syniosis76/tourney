export const about = {
  template: `
<div>
  <div>Version {{ version }}</div>
  <p>
    <router-link to="/cities">Cities</router-link>  
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

