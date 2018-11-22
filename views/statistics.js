export const statistics = {
  template: `
<div class="mainmargin">
  <div v-if="loading" class="flexcolumn">
    Loading...
  </div>
  <div v-else-if="statistics" class="flexcolumn">     
    <div class="flexrow">
      <div class="tournamentheader">          
        <h1>{{ statistics.name }}</h1>
        <div class="endspacer"></div>
        <div class="flexrow flexcenter menurow">          
          <router-link :to="'/tournament/' + statistics.id"><svg class="link-button"><use xlink:href="/html/icons.svg/#list"></use></svg></router-link>
          &nbsp;
          <svg class="selected-button"><use xlink:href="/html/icons.svg/#trophy"></use></svg>
          &nbsp;
          <router-link :to="'/information/' + statistics.id"><svg class="link-button"><use xlink:href="/html/icons.svg/#info"></use></svg></router-link>  
          &nbsp;
          <input v-model="searchText" placeholder="search" style="width: 100px"/>
        </div>                
      </div>        
    </div>
    <div class="endspacer"></div>
    <div class="endspacer"></div>
    <div class="endspacer"></div>
    <template v-if="statistics.groups && statistics.groups.length > 0" class="flexcolumn">
      <template v-for="group in statistics.groups">
        <div class="card">
          <div class="cardheader flexrow flexcenter">
            <h3>{{ group.name }}</h3>
            <div v-if="statistics.canEdit" class="dropdown">          
              <svg v-on:click="localShowDropdown($event, 'groupDropdown' + group.name)" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>
              <div :id="'groupDropdown' + group.name" class="dropdown-content">                              
                <a v-on:click="updateTeamNames(group.name, false)">Update Team Names</a>
                <a v-on:click="updateTeamNames(group.name, true)">Revert Team Names</a>              
              </div>
            </div>
          </div>
          <div>    
            <table id="group">
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Team</th>
                  <th>PT</th>
                  <th>GD</th>    
                  <th>GF</th>          
                  <th>PL</th>            
                </tr>
              </thead>
              <tbody>
                <template v-for="(team, index) in group.teams">                                  
                  <tr :class="{ searchrow: searchMatches(team.name, searchText) }">                               
                    <td>{{ ordinalSuffix(index + 1) }}</td>
                    <td :class="{ searchitem: searchMatches(team.name, searchText) }">{{ team.name }}</td>
                    <td>{{ team.points }}</td>
                    <td>{{ team.goalDifference }}</td>
                    <td>{{ team.goalsFor }}</td>
                    <td>{{ team.played }}</td>
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
      No games gave completed yet. Check back when the Torunament is underway.
    </template>
  </div>
  <div v-else>
    <p>Statistics not found.</p>  
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
    localShowDropdown: function(event, name) {
      showDropdown(event, name)
    },
    getStatistics: function(id)
    {
      var _this = this
      _this.loading = true
      _this.tournament = undefined

      oboe({
        method: 'GET',
        url: '/data/tournament/' + id + '/statistics',
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
    updateTeamNames: function(name, revert)
    {
      var _this = this
      _this.loading = true

      var id = this.$route.params.id;
      var group = _this.statistics.groups.find(group => group.name === name);
      if (group) {        
        var data = { 'group': group, 'revert': revert };

        oboe({
          method: 'PUT',
          url: '/data/tournament/' + id + '/statistics',
          headers: this.$googleUser.headers,
          body: data
        })      
        .done(function(statistics)
        {
          _this.refresh();
        })
        .fail(function (error) {
          console.log(error);
          alert('Oops, something went wrong :(');       
          _this.loading = false;
        });
      }
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