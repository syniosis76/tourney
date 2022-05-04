export const playerStatistics = {
  template: `
<div class="mainmargin">
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  <div v-if="statistics" class="flexcolumn">     
    <div class="flexrow">
      <div class="tournamentheader">          
        <h2>{{ _statistics.name }}</h2>
        <div class="flexrow flexcenter menurow">          
          <router-link :to="'/' + _statistics.id"><svg class="linkbutton"><use xlink:href="/html/icons.svg/#list"></use></svg></router-link>
          &nbsp;
          <router-link :to="'/statistics/' + _statistics.id"><svg class="linkbutton"><use xlink:href="/html/icons.svg/#trophy"></use></svg></router-link>                    
          &nbsp;
          <svg class="selectedbutton"><use xlink:href="/html/icons.svg/#chart"></use></svg>
          &nbsp;
          <router-link :to="'/information/' + _statistics.id"><svg class="linkbutton"><use xlink:href="/html/icons.svg/#info"></use></svg></router-link>
          &nbsp;
          <input v-model="$root.$data.searchText" placeholder="search" style="width: 100px"/>
        </div>                
      </div>        
    </div>
  </div>
  <div v-if="statistics">
    <div class="endspacer"></div>
    <div class="endspacer"></div>
    <a v-on:click="showPlayerGoals">Goals</a> | <a v-on:click="showTeamGoals">Team Goals</a> | <a v-on:click="showPlayerCards">Cards</a> | <a v-on:click="showTeamCards">Team Cards</a> | <a v-on:click="showCardList">Card List</a>
    <div class="endspacer"></div>
    <template v-if="statistics.grades && statistics.grades.length > 0" class="flexcolumn">      
      <template v-for="grade in statistics.grades">
        <div class="card">
          <div class="cardheader flexrow flexcenter">
            <h3>{{ grade.name }}</h3>            
          </div>
          <div>
            <table v-if="mode === 'CL'" id="grade">
              <thead>                
                <tr>                   
                  <th>Team</th>
                  <th>Player</th>
                  <th>Card</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="card in grade.cards">                                  
                  <tr :class="{ searchrow: searchMatches(card.team, $root.$data.searchText) }">                                                   
                    <td :class="{ searchitem: searchMatches(card.team, $root.$data.searchText) }">{{ card.team }}</td>
                    <td>#{{ card.player }}</td>
                    <td>{{ card.type }}</td>
                    <td>{{ card.reason }}</td>
                  </tr>
                </template>                
              </tbody>    
            </table>  
            <table v-else id="grade">
              <thead>                
                <tr>
                  <th v-if="mode === 'PG' || mode === 'TG'">Place</th>  
                  <th>Team</th>
                  <th v-if="mode === 'PG' || mode === 'PC'">Player</th>
                  <th v-if="mode === 'PG' || mode === 'TG'">Goals</th>
                  <th v-if="mode === 'PC' || mode === 'TC'">Red</th>            
                  <th v-if="mode === 'PC' || mode === 'TC'">Yellow</th>          
                  <th v-if="mode === 'PC' || mode === 'TC'">Green</th>                                        
                </tr>
              </thead>
              <tbody>
                <template v-for="(player, index) in grade.players">                                  
                  <tr :class="{ searchrow: searchMatches(player.team, $root.$data.searchText) }">                               
                    <td v-if="mode === 'PG' || mode === 'TG'">{{ ordinalSuffix(index + 1) }}</td>
                    <td :class="{ searchitem: searchMatches(player.team, $root.$data.searchText) }">{{ player.team }}</td>
                    <td v-if="mode === 'PG' || mode === 'PC'">#{{ player.player }}</td>                                      
                    <td v-if="mode === 'PG' || mode === 'TG'">{{ player.goals }}</td>                                      
                    <td v-if="mode === 'PC' || mode === 'TC'">{{ player.redCards }}</td>
                    <td v-if="mode === 'PC' || mode === 'TC'">{{ player.yellowCards }}</td>
                    <td v-if="mode === 'PC' || mode === 'TC'">{{ player.greenCards }}</td>                    
                  </tr>
                </template>                
              </tbody>    
            </table>
          </div>  
        </div>
        <div class="endspacer"></div>
      </template>
      <div class="footerspacer"></div>
    </template>
    <template v-else>
      No game logs are available yet.
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
      var grades = [];      
      this._statistics.grades.forEach(function (sourceGrade) {
        var grade = { name: sourceGrade.name };
        grades.push(grade);
        grade.players = sourceGrade.players.filter(player => player.goals > 0);
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
      var grades = [];      
      this._statistics.grades.forEach(function (sourceGrade) {
        var grade = { name: sourceGrade.name };
        grades.push(grade);
        grade.players = sourceGrade.players.filter(player => player.redCards + player.yellowCards + player.greenCards > 0);
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
    showCardList: function()
    {
      this.mode = 'CL';
      this.statistics = { grades: this._statistics.grades };
    },
    showMode: function()
    {
      if (this.mode === 'PG') this.showPlayerGoals()
      else if (this.mode === 'PC') this.showPlayerCards()
      else if (this.mode === 'TG') this.showTeamGoals()
      else if (this.mode === 'TC') this.showTeamCards()
      else if (this.mode === 'CL') this.showCardList()
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
    textMatches: function(text, matchText)
    {
      return matchText === text || (matchText.length >= 3 && text.includes(matchText));
    },
    searchMatches: function(text, searchText) {
      if (text && searchText) {                        
        let lowerText = text.toLowerCase();
        let lowerSearchText = searchText.toLowerCase();
        let searchParts = lowerSearchText.split(',')
        for (let index in searchParts) {
          let part = searchParts[index].trim()
          if (this.textMatches(lowerText, part)) {
            return true;
          }
        }        
      }
      return false;
    }
  }   
};