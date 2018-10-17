export const tournament = {
  template: `
<div class="mainmargin">
  <div v-if="tournament" class="flexcolumn">    
    <div class="flexrow">
      <div class="tournamentheader fixedleft">  
        <div class="flexrow flexcenter">  
          <h1>{{ tournament.name }}</h1>      
          <div class="dropdown">          
            <svg onclick="showDropdown(event, 'tournamentDropdown')" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>
            <div id="tournamentDropdown" class="dropdown-content">
              <router-link :to="'/tournament/' + tournament.id.value + '/edit'">Edit Tournament Details</router-link>
              <a v-on:click="deleteTournament">Delete Tournament</a>
              <a v-on:click="addDate">Add Date</a>
              <a v-on:click="calculateStatistics">Calculate Statistics</a>
            </div>
          </div>
        </div>
      </div>
    </div>    
    <template v-if="tournament.gameDates" class="flexcolumn">
      <template v-for="gameDate in tournament.gameDates.data">
        <gameDate :tournament="tournament" :gameDate="gameDate"></gameDate>                
      </template>
    </template>
    <div class="endspacer"></div>    
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
    calculateStatistics: function()
    {
      var _this = this
      if (_this.tournament != undefined)
      {        
        oboe({
          method: 'GET',
          url: '/data/tournament/' + _this.tournament.id.value + '/statistics'                   
      })
      .done(function(tournament)
      {
        //_this.getTournament(_this.tournament.id.value)
      })
      .fail(function (error) {
        console.log(error);        
        alert('Unable to calculate statistics.')
      });
      }
    }
  }   
};