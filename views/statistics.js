export const statistics = {
  template: `
<div class="mainmargin">
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  <div v-if="statistics" class="flexcolumn">     
    <toolbar :tournament="statistics"></toolbar>  
  </div>
  <div v-if="statistics">
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
                  <th title="Points">PT</th>
                  <th title="Goal Difference">GD</th>    
                  <th title="Goals For">GF</th>          
                  <th title="Goals Against">GA</th>
                  <th title="Card Points">CP</th>
                  <th title="Games Played">PL</th>            
                </tr>
              </thead>
              <tbody>
                <template v-for="(team, index) in group.teams">                                  
                  <tr :class="{ searchrow: searchMatches(team.name, $root.$data.searchText) }">                               
                    <td>{{ ordinalSuffix(index + 1) }}</td>
                    <td :class="{ searchitem: searchMatches(team.name, $root.$data.searchText) }">{{ team.name }}</td>
                    <td>{{ team.points }}</td>
                    <td>{{ team.goalDifference }}</td>
                    <td>{{ team.goalsFor }}</td>
                    <td>{{ team.goalsAgainst }}</td>
                    <td>{{ team.cardPoints }}</td>
                    <td>{{ team.played }}</td>
                  </tr>
                </template>                
              </tbody>    
            </table>
          </div>  
        </div>
        <div class="endspacer"></div>
      </template>
      <h3>Key</h3>
      <b>PT</b>: Points<br/>
      <b>GD</b>: Goal Difference<br/>
      <b>GF</b>: Goals For<br/>    
      <b>GA</b>: Goals Against<br/>
      <b>VR</b>: Verses Result - Not displayed.<br/>
      <b>CP</b>: Card Points<br/>
      <b>PL</b>: Games Played<br/>
      <div class="footerspacer"></div>
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