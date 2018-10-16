export const tournament = {
  template: `
<div class="mainroute">
  <div v-if="tournament" class="flexcolumn scrollx">    
    <div>  
      <div class="tournamentheader">  
        <div class="fixedleft flexrow flexcenter">  
          <h1>{{ tournament.name }}</h1>      
          <div class="dropdown">          
            <svg onclick="showDropdown(event, 'tournamentDropdown')" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>
            <div id="tournamentDropdown" class="dropdown-content">
              <router-link :to="'/tournament/' + tournament.id.value + '/edit'">Edit Tournament Details</router-link>
              <a v-on:click="deleteTournament">Delete Tournament</a>
              <a v-on:click="addDate">Add Date</a>
            </div>
          </div>
        </div>
      </div>
    </div>    
    <template v-if="tournament.gameDates" class="flexcolumn">
      <template v-for="gameDate in tournament.gameDates.data">
        <gameDate :tournament="tournament" :gameDate="gameDate"></gameDate>        
        <div v-if="gameDate.pitches" class="flexrow">
          <div class="card fixedleft">
            <div class="pitchheader"></div>
            <table id="game-times" class="selectable">
              <thead>
                <tr><th>Time</th></tr>
              </thead>
              <tbody>
                <template v-for="index in maxGameCount(gameDate) - 1">
                  <tr v-on:click="selectGame($event, gameDate)" v-on:mouseover="hoverGame($event, gameDate)" v-on:mouseout="hoverGame(null, gameDate)" :class="{ trselected: index === gameDate.selectedIndex, trhover: index === gameDate.hoverIndex }">  
                    <td>00:00</td>
                  </tr>
                </template> 
              </tbody>    
            </table>
          </div>
          <div class="pitchindent flexrow">
            <div v-for="pitch in gameDate.pitches.data">
              <pitch :tournament="tournament" :gameDate="gameDate" :pitch="pitch"></pitch>
            </div>
          </div>
        </div>
      </template>
    </template>    
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
    maxGameCount: function(gameDate)
    {
      var count = 0;
      gameDate.pitches.data.forEach(pitch => {
        if (pitch.games.data.length > count) count = pitch.games.data.length;
      });
      return count;
    },
    selectGame: function(event, gameDate) {
      var index = event.currentTarget.rowIndex;      
      Vue.set(gameDate, 'selectedIndex', index);    
    },
    hoverGame: function(event, gameDate) {
      var index = -1;
      if (event) index = event.currentTarget.rowIndex;
      Vue.set(gameDate, 'hoverIndex', index);
    }
  }   
};