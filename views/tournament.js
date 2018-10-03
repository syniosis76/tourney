export const tournament = {
  template: `
<div class="mainroute">
  <div v-if="tournament" class="flexcolumn">    
    <div class="largetext">{{ tournament.name }}</div>
    <div>
      <span v-if="tournament.startDate">{{ tournament.startDate.value | formatDate }}</span>
      <span v-if="tournament.endDate"> to {{ tournament.endDate.value | formatDate }}</span>
    </div>    
    <!--<pitch :tournamentId="tournament.id.value"></pitch>-->
    <div v-if="tournament.gameDates"  class="flexcolumn">
      <div v-for="gameDate in tournament.gameDates.data">
        <div>
          <div>GameDate {{ gameDate.date.value | formatDate }}</div>
          <div v-if="gameDate.pitches"  class="flexrow">
            <div v-for="pitch in gameDate.pitches.data">     
              <div class="pitch">{{ pitch.name }}</div>              
            </div>
          </div>
        </div>
        <a v-on:click="addPitch(gameDate.id.value)">Add Pitch</a>
        <a v-on:click="deleteDate(gameDate.id.value)">Delete Date</a>
      </div>
    </div>
    <a v-on:click="addDate">Add Date</a>
    <div>
      <router-link :to="'/tournament/' + tournament.id.value + '/edit'">Edit</router-link>
      |
      <a v-on:click="deleteTournament">Delete</a>
    </div>
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
    deleteTournament: function()
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        console.log('Delete', _this.tournament.name)
        oboe({
          method: 'DELETE',
          url: '/data/tournament/' + _this.tournament.id.value,                    
      })
      .done(function(tournament)
      {
        _this.$router.push('/')
      })
      .fail(function (error) {
        console.log(error);        
        alert('Unable to delete.')
      });
      }
    },
    addDate: function()
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        console.log('Add Date for', _this.tournament.name)
        oboe({
          method: 'PUT',
          url: '/data/tournament/' + _this.tournament.id.value + '/adddate'                   
      })
      .done(function(tournament)
      {
        _this.getTournament(_this.tournament.id.value)
      })
      .fail(function (error) {
        console.log(error);        
        alert('Unable to add Date.')
      });
      }
    },
    deleteDate: function(dateId)
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        console.log('Delete date', dateId)
        oboe({
          method: 'DELETE',
          url: '/data/tournament/' + _this.tournament.id.value + '/date/' + dateId                   
      })
      .done(function(tournament)
      {
        _this.getTournament(_this.tournament.id.value)
      })
      .fail(function (error) {
        console.log(error);        
        alert('Unable to delete date.')
      });
      }
    },
    addPitch: function(dateId)
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        console.log('Add Pitch for ', _this.tournament.name)
        oboe({
          method: 'PUT',
          url: '/data/tournament/' + _this.tournament.id.value + '/date/' + dateId + '/addpitch'                   
      })
      .done(function(tournament)
      {
        _this.getTournament(_this.tournament.id.value)
      })
      .fail(function (error) {
        console.log(error);        
        alert('Unable to add Pitch.')
      });
      }
    }
  }    
};