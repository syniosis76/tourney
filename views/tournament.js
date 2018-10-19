export const tournament = {
  template: `
<div class="mainmargin">
  <div v-if="loading" class="flexcolumn">
    Loading...
  </div>
  <div v-else-if="tournament" class="flexcolumn">    
    <div class="flexrow">
      <div class="tournamentheader fixedleft">  
        <div class="flexrow flexcenter">  
          <h1>{{ tournament.name }}</h1>
          <router-link :to="'/statistics/' + tournament.id.value" class="linkspace">Results</router-link>      
          <div class="dropdown">          
            <svg onclick="showDropdown(event, 'tournamentDropdown')" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>
            <div id="tournamentDropdown" class="dropdown-content">
              <template v-if="$route.query.mode == 'edit'">
                <router-link :to="'/tournament/' + tournament.id.value + '/edit'">Edit Tournament Details</router-link>
                <a v-on:click="deleteTournament">Delete Tournament</a>
                <a v-on:click="addDate">Add Date</a>
                <router-link :to="'/tournament/' + tournament.id.value + '?mode=view'">View</router-link>
              </template>
              <template v-else>
                <router-link :to="'/tournament/' + tournament.id.value + '?mode=edit'">Edit</router-link>
              </template>
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
        if (confirm("Are you sure you want to delete " + _this.tournament.name + "?")) {
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
        };
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
    }
  }   
};