export const about = {
  template: `
<div class="mainmargin">
  <p>Version {{ version }}</p>
  <p><a href="https://www.facebook.com/canoepolotourney">Facebook</a></p>
  <p>© 2022 Stacey Verner</p>
  <p><router-link to="/tournaments">Tournaments</router-link></p>
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

