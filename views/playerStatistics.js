export const playerStatistics = {
  template: `
<div class="mainmargin">
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  <div v-if="statistics" class="flexcolumn">     
    <div class="flexrow">
      <div class="tournamentheader">          
        <h1>{{ statistics.name }}</h1>
        <div class="flexrow flexcenter menurow">          
          <router-link :to="'/' + statistics.id"><svg class="linkbutton"><use xlink:href="/html/icons.svg/#list"></use></svg></router-link>
          &nbsp;
          <router-link :to="'/statistics/' + statistics.id"><svg class="linkbutton"><use xlink:href="/html/icons.svg/#trophy"></use></svg></router-link>                    
          &nbsp;
          <svg class="selectedbutton"><use xlink:href="/html/icons.svg/#chart"></use></svg>
          &nbsp;
          <router-link :to="'/information/' + statistics.id"><svg class="linkbutton"><use xlink:href="/html/icons.svg/#info"></use></svg></router-link>
          &nbsp;
          <input v-model="searchText" placeholder="search" style="width: 100px"/>
        </div>                
      </div>        
    </div>
  </div>
  <div v-if="statistics">
    <a v-on:click="showPlayerGoals">Goals</a> | <a v-on:click="showPlayerCards">Cards</a> | <a v-on:click="showTeamGoals">Team Goals</a> | <a v-on:click="showTeamCards">Team Cards</a>
    <div class="endspacer"></div>
    <template v-if="statistics.grades && statistics.grades.length > 0" class="flexcolumn">
      <template v-for="grade in statistics.grades">
        <div class="card">
          <div class="cardheader flexrow flexcenter">
            <h3>{{ grade.name }}</h3>            
          </div>
          <div>    
            <table id="grade">
              <thead>
                <tr>
                  <th></th>  
                  <th></th>
                  <th v-if="mode === 'PG' || mode === 'PC'"></th>
                  <th></th>
                  <th colspan="3">Cards</th>                                     
                </tr>
                <tr>
                  <th>Place</th>  
                  <th>Team</th>
                  <th v-if="mode === 'PG' || mode === 'PC'">Player</th>
                  <th>Goals</th>
                  <th>R</th>            
                  <th>Y</th>          
                  <th>G</th>                                        
                </tr>
              </thead>
              <tbody>
                <template v-for="(player, index) in grade.players">                                  
                  <tr :class="{ searchrow: searchMatches(player.team, searchText) }">                               
                    <td>{{ ordinalSuffix(index + 1) }}</td>
                    <td :class="{ searchitem: searchMatches(player.team, searchText) }">{{ player.team }}</td>
                    <td v-if="mode === 'PG' || mode === 'PC'">{{ player.player }}</td>                                      
                    <td>{{ player.goals }}</td>                                      
                    <td>{{ player.redCards }}</td>
                    <td>{{ player.yellowCards }}</td>
                    <td>{{ player.greenCards }}</td>                    
                  </tr>
                </template>                
              </tbody>    
            </table>
          </div>  
        </div>
        <div class="endspacer"></div>
      </template>
    </template>
    <template v-else>
      No games gave completed yet. Check back when the Tournament is underway.
    </template>
  </div>
  <div v-if="!statistics && !loading">
    <p>Oops. Something went wrong.</p>  
    <router-link to="/tournaments">Tournaments</router-link>
  </div>
</div>
  `,
  data () {
    return {
      loading: false,
      _statistics: undefined,
      statistics: undefined,
      mode: 'PG',
      searchText: '',
      googleUser: this.$googleUser
    }
  },
  created () {    
    this.refresh();
  },
  mounted() {
    this.waitForGoogleUser();
  },
  methods:
  {
    refresh: function() {
      this.getStatistics(this.$route.params.id)
    },
    waitForGoogleUser: function() {
      if (!this.googleUser.isSignedIn) {
        this.googleUser.checkGoogleUser(this.onGoogleUserCheckComplete);
      }
    },
    onGoogleUserCheckComplete: function() {
      if (this.googleUser.isSignedIn) {
        this.refresh();
      }  
    },
    showPlayerGoals: function()
    {
      this.mode = 'PG'
      var grades = Array.from(this._statistics.grades);
      grades.forEach(function (grade) {
        grade.players.sort(function(a, b) {
          var result = b.goals - a.goals;
          if (result === 0) result = a.team.localeCompare(b.team);
          if (result === 0) result = a.player - b.player;
          return result;
        });
      });
      this.statistics = { grades: grades };
    },
    showPlayerCards: function()
    {      
      this.mode = 'PC';
      var grades = Array.from(this._statistics.grades);
      grades.forEach(function (grade) {
        grade.players.sort(function(a, b) {
          var aCardScore = (a.redCards * 10) + (a.yellowCards * 5)  + (a.greenCards * 1);
          var bCardScore = (b.redCards * 10) + (b.yellowCards * 5)  + (b.greenCards * 1);
          var result = bCardScore - aCardScore;
          if (result === 0) result = a.team.localeCompare(b.team);
          if (result === 0) result = a.player - b.player;
          return result;
        });
      });
      this.statistics = { grades: grades };
    },
    showTeamGoals: function()
    {
      this.mode = 'TG';
      var grades = [];
      
      this._statistics.grades.forEach(function (sourceGrade) {
        var grade = { name: sourceGrade.name };
        grades.push(grade);

        grade.players = []
        sourceGrade.players.forEach(function (sourcePlayer) {
          var player = grade.players.find(function(player) { return player.team === sourcePlayer.team; });
          if (!player)
          {
            player = { team: sourcePlayer.team, goals: 0, redCards: 0, yellowCards: 0, greenCards: 0 };
            grade.players.push(player);
          }
          player.goals += sourcePlayer.goals;
          player.redCards += sourcePlayer.redCards;
          player.yellowCards += sourcePlayer.yellowCards;
          player.greenCards += sourcePlayer.greenCards;
        });

        grade.players.sort(function(a, b) {
          var result = b.goals - a.goals;
          if (result === 0) result = a.team.localeCompare(b.team);
          return result;
        });
      });

      this.statistics = { grades: grades };
    },
    showTeamCards: function()
    {
      this.mode = 'TC'
      var grades = [];
      
      this._statistics.grades.forEach(function (sourceGrade) {
        var grade = { name: sourceGrade.name };
        grades.push(grade);

        grade.players = []
        sourceGrade.players.forEach(function (sourcePlayer) {
          var player = grade.players.find(function(player) { return player.team === sourcePlayer.team; });
          if (!player)
          {
            player = { team: sourcePlayer.team, goals: 0, redCards: 0, yellowCards: 0, greenCards: 0 };
            grade.players.push(player);
          }
          player.goals += sourcePlayer.goals;
          player.redCards += sourcePlayer.redCards;
          player.yellowCards += sourcePlayer.yellowCards;
          player.greenCards += sourcePlayer.greenCards;
        });

        grade.players.sort(function(a, b) {
          var aCardScore = (a.redCards * 10) + (a.yellowCards * 5)  + (a.greenCards * 1);
          var bCardScore = (b.redCards * 10) + (b.yellowCards * 5)  + (b.greenCards * 1);
          var result = bCardScore - aCardScore;
          if (result === 0) result = a.team.localeCompare(b.team);
          return result;
        });
      });

      this.statistics = { grades: grades };
    },
    showMode: function()
    {
      if (this.mode === 'PG') this.showPlayerGoals()
      else if (this.mode === 'PC') this.showPlayerCards()
      else if (this.mode === 'TG') this.showTeamGoals()
      else if (this.mode === 'TC') this.showTeamCards()
    },
    getStatistics: function(id)
    {
      var _this = this
      _this.loading = true

      oboe({
        method: 'GET',
        url: '/data/tournament/' + id + '/playerstatistics',
        headers: this.$googleUser.headers
      })      
      .done(function(statistics)
      {
        console.log('Loaded statistics for ' + id);        
        _this._statistics = statistics;
        _this.showMode();
        _this.loading = false;
      })
      .fail(function (error) {
        console.log(error);        
        _this.loading = false;
      });
    },
    ordinalSuffix: function (i)
    {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    },
    searchMatches: function(text, searchText) {
      if (text && searchText) {
        let lowerText = text.toLowerCase();
        let lowerSearchText = searchText.toLowerCase();
        return lowerText === lowerSearchText || (lowerSearchText.length >= 3 && lowerText.includes(lowerSearchText));
      }
      return false;
    }
  }   
};