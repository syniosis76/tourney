export const cities = {
  template: `
<div>
  <table id="cities">
  <thead>
    <tr>
      <th style="min-width: 150px;"><a v-on:click="getCities('name')">City</a></th>
      <th><a v-on:click="getCities('population')">Population</a></th>            
    </tr>
  </thead>
  <tbody>
    <tr v-for="city in cities">
      <td>{{ city.name }}</td>
      <td>{{ city.population }}</td>
    </tr> 
  </tbody>    
  </table>
  <p>  
    <router-link to="/about">About</router-link>
  </p>
</div>
`,
  data () {
    return {
      loading: false,
      cities: []
    }
  },
  created () {
    this.getCities()
  },
  watch: {
    // call again the method if the route changes
    "$route": "getCities('name')"
  },
  methods:
  {
    getCities: function(url)
    {
      var _this = this
      _this.loading = true
      _this.cities = []      

      oboe('/data/cities/' + url)
      .node('!.[*]', function(city)
      {    
        console.log('Got city', city);
        _this.cities.push(city);
      })
      .done(function(cities)
      {
        console.log('Loaded', cities.length, 'cities');
        this.loading = false
      })
      .fail(function (error) {
        console.log(error);
        this.loading = false
        _this.cities = 'Error!';
      });
    }
  }    
};