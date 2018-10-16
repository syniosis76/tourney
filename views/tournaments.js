export const tournaments = {
  template: `
<div class="mainroute">
  <div>
    <table id="tournaments" class="card fullwidth maxwidthmedium spacious selectable">
    <thead>
      <tr>
        <th>Tournament</th>
        <th>Date</th>            
      </tr>
    </thead>
    <tbody>
      <template v-for="tournament in tournaments">
        <router-link tag="tr" :to="'/tournament/' + tournament.id.value">
          <td>{{ tournament.name }}</td>
          <td><div v-if="tournament.startDate">{{ tournament.startDate.value | formatDate }}</div></td>
        </router-link>
      </template>
    </tbody>    
    </table>
  </div>
  <p>      
    <router-link to="/tournament/new/edit">Add</router-link>
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
    this.getTournaments()
  },  
  methods:
  {
    getTournaments: function()
    {
      var _this = this
      _this.loading = true
      _this.tournaments = []      

      oboe('/data/tournaments')
      .node('!.[*]', function(tournament)
      {    
        console.log('Got tournament', tournament);
        _this.tournaments.push(tournament);
      })
      .done(function(tournaments)
      {
        console.log('Loaded', tournaments.length, 'tournaments');
        _this.loading = false
      })
      .fail(function (error) {
        console.log(error);
        _this.loading = false
        _this.tournaments = 'Error!';
      });
    }
  }    
};