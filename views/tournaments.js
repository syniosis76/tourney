export const tournaments = {
  template: `
<div class="fullwidth mainmargin">  
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>  
  <div v-else>
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
    <template v-if="canEdit">
      <p><router-link to="/tournament/new/edit">Add</router-link></p>
    </template>
  </div>
</div>
`,
  data () {
    return {
      loading: false,
      tournaments: [],
      canEdit: false
    }
  },
  created () {
    this.getTournaments()
  },  
  methods:
  {
    refresh: function() {
      this.getTournaments();
    },
    getTournaments: function() {
      var _this = this
      _this.loading = true
      _this.tournaments = []      

      oboe({
        method: 'GET',
        url: '/data/tournaments',                    
        headers: this.$googleUser.headers
      })         
      .node('tournaments.[*]', function(tournament)
      {    
        _this.tournaments.push(tournament);
      })
      .done(function(tournaments)
      {
        _this.canEdit = tournaments.canEdit;
        _this.loading = false;
      })
      .fail(function (error) {
        console.log(error);
        _this.loading = false
        _this.tournaments = 'Error!';
      });
    }
  }    
};