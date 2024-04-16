export const tournamentEdit = {
  template: `
<div class="editmargin">
  <div v-if="loading" class="flexcolumn">
    Loading...
  </div>
  <div v-else-if="tournament">    
    <input v-model="tournament.name" placeholder="name" class="largeinput"/>
    <div class="inputlabel">Name</div>    
    <input v-model="startDateValue" placeholder="start date" type="date"/>
    <div class="inputlabel">Start Date</div>
    <input v-model="endDateValue" placeholder="end date" type="date"/>
    <div class="inputlabel">End Date</div>    
    <textarea v-model="tournament.info" placeholder="info" style="width: 300px; height: 80px;"></textarea>
    <div class="inputlabel">Information</div>
    <input v-model="tournament.webSite" placeholder="web site" />
    <div class="inputlabel">Web Site</div>
    <input class="gameinputtiny" v-model="tournament.gradePrefixLength" placeholder="grade prefix length" type="number"/>
    <div class="inputlabel">Grade Prefix Length e.g. OA-1 > [OA]-1 > 2</div>
    <table>
      <tr>
        <td><input class="gameinputtiny" v-model="tournament.points_win" placeholder="points for a win" type="number"/></td>
        <td><input class="gameinputtiny" v-model="tournament.points_draw" placeholder="points for a draw" type="number"/></td>
        <td><input class="gameinputtiny" v-model="tournament.points_loss" placeholder="points for a loss" type="number"/></td>
        <td><input class="gameinputtiny" v-model="tournament.points_default" placeholder="points for a default" type="number"/></td>
      </tr>
      <tr>
        <td><div class="inputlabel">Win</div></td>
        <td><div class="inputlabel">Draw</div></td>
        <td><div class="inputlabel">Loss</div></td>
        <td><div class="inputlabel">Default</div></td>
      </tr>
    </table>    
    <div>      
      <input type="checkbox" id="publish" v-model="tournament.publish"/>
      <label for="publish">Publish on Main List</label>
    </div>
    <template v-if="tournament.administrators && tournament.administrators">
      <h3>Administrators</h3>
      <p>
        <template v-for="administrator in tournament.administrators">
          {{ administrator }}&nbsp;&nbsp;<a v-on:click="removeAdministrator(administrator)">Remove</a><br/>
        </template>
      </p>
      <input v-model="newAdministrator"/>&nbsp;<button v-on:click="addAdministrator(newAdministrator)">Add</button>
    </template>
    <p><button v-on:click="putTournament">Save</button>&nbsp;&nbsp;<router-link :to="'/' + tournament.id.value">View</router-link></p>  
  </div>
  <div v-else>
    <p>Tournament not found.</p>  
    <router-link to="/tournaments">Tournaments</router-link>
  </div>
</div>
`,
  data () {
    return {
      loading: false,
      tournament: undefined,
      newAdministrator: ''
    }
  },
  computed: {
    startDateValue: {      
      get: function () {
        if (this.tournament.startDate && this.tournament.startDate.value) {
          return this.tournament.startDate.value.substring(0, 10);
        }
        return undefined;
      },      
      set: function (newValue) {
        this.tournament.startDate = { _type: 'datetime', value: newValue };
      }
    },
    endDateValue: {      
      get: function () {
        if (this.tournament.endDate && this.tournament.endDate.value) {
          return this.tournament.endDate.value.substring(0, 10);
        }
        return undefined;
      },      
      set: function (newValue) {
        this.tournament.endDate = { _type: 'datetime', value: newValue };
      }
    }
  },
  created () {
    this.getTournament(this.$route.params.id)
  },
  methods:
  {
    addAdministrator: function(administrator) {
      this.tournament.administrators.push(administrator);
      this.newAdministrator = '';
    },
    removeAdministrator: function(administrator) {
      var index = this.tournament.administrators.indexOf(administrator); 
      if (index > -1) {
        this.tournament.administrators.splice(index, 1);
      }
    },
    getTournament: function(id) {
      var _this = this
      _this.loading = true
      _this.tournament = undefined

      oboe('/data/tournament/' + id)      
      .done(function(tournament)
      {
        console.log('Loaded tournament ' + tournament.id.value);        
        _this.tournament = tournament
        _this.loading = false
      })
      .fail(function (error) {
        console.log(error);        
        _this.loading = false
      });
    },
    putTournament: function() {
      var _this = this
      _this.loading = true
      if (_this.tournament != undefined)
      {
        console.log('Save ', _this.tournament.name)
        oboe({
          method: 'PUT',
          url: '/data/tournament/',          
          body: _this.tournament
      })
      .done(function(response)
      {
        console.log('Tournament saved ' + response);        
        _this.loading = false
        _this.$router.push('/tournament/' + _this.tournament.id.value + '/edit')
      })
      .fail(function (error) {
        console.log(error);        
        _this.loading = false
      });
      }
    }
  }    
};