export const tournamentEdit = {
  template: `
<div class="mainmargin">
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
    <p><button v-on:click="putTournament">Save</button></p>  
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
      tournament: undefined
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
    getTournament: function(id)
    {
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
    putTournament: function()
    {
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