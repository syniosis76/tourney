export const tournaments = {
  template: `
<div>
  <table id="tournaments">
  <thead>
    <tr>
      <th style="min-width: 200px;"><a v-on:click="getTournaments('name')">Tournament</a></th>
      <th><a v-on:click="getTournaments('date')">Date</a></th>            
    </tr>
  </thead>
  <tbody>
    <tr v-for="tournament in tournaments">
      <td>{{ tournament.name }}</td>
      <td>{{ tournament.startDate.value  | formatDate }}</td>
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
      tournaments: []
    }
  },
  created () {
    this.getTournaments('name')
  },
  watch: {
    // call again the method if the route changes
    "$route": "getTournaments('name')"
  },
  methods:
  {
    getTournaments: function(url)
    {
      var _this = this
      _this.loading = true
      _this.tournaments = []      

      oboe('/data/tournaments/' + url)
      .node('!.[*]', function(tournament)
      {    
        console.log('Got tournament', tournament);
        _this.tournaments.push(tournament);
      })
      .done(function(tournaments)
      {
        console.log('Loaded', tournaments.length, 'tournaments');
        this.loading = false
      })
      .fail(function (error) {
        console.log(error);
        this.loading = false
        _this.tournaments = 'Error!';
      });
    }
  }    
};