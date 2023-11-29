export const about = {
  template: `
<div class="mainmargin">
  <p>Version {{ version }}</p>
  <p><a href="https://sites.google.com/verner.co.nz/scoreboard/tourney" target="_blank">Documentation</a></p>
  <p><a href="https://sites.google.com/verner.co.nz/scoreboard/home" target="_blank">Scoreboard</a></p>
  <p><a href="https://www.facebook.com/canoepolotourney" target="_blank">Facebook</a></p>    
  <p><router-link to="/tournaments">Tournaments</router-link></p>
  <p>© 2023 Stacey Verner</p>
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
    
  },
  methods:
  {
    getVersion: function()
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

