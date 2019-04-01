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
    <div class="endspacer"></div>
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
                  <th>Place</th>  
                  <th>Team</th>
                  <th>Player</th>
                  <th>Goal</th>
                  <th>RC</th>            
                  <th>YC</th>          
                  <th>GC</th>                                        
                </tr>
              </thead>
              <tbody>
                <template v-for="(player, index) in grade.players">                                  
                  <tr :class="{ searchrow: searchMatches(player.team, searchText) }">                               
                    <td>{{ ordinalSuffix(index + 1) }}</td>
                    <td :class="{ searchitem: searchMatches(player.team, searchText) }">{{ player.team }}</td>
                    <td>{{ player.player }}</td>                                      
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
      statistics: undefined,
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
        _this.statistics = statistics;
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