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
        <router-link :to="'/' + tournament.id.value" custom v-slot="{ navigate }">
          <tr @click="navigate" @keypress.enter="navigate" role="link">
            <td>{{ tournament.name }}</td>
            <td><div v-if="tournament.startDate">{{ new Date(tournament.startDate.value).toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" }).replaceAll(",", "") }}</div></td>
          </tr>
        </router-link>
      </template>
    </tbody>    
    </table>
    <template v-if="canEdit">
      <p>&nbsp;&nbsp;<router-link to="/tournament/new/edit">Add</router-link></p>
    </template>
    <div class="footerspacer"></div>
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