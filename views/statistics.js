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
        <h3><router-link :to="'/tournament/' + statistics.id">Games</router-link></h3>        
      </div>        
    </div>
    <div class="endspacer"></div>
    <template v-if="statistics.groups" class="flexcolumn">
      <template v-for="group in statistics.groups">
        <div class="card">
          <div class="cardheader flexrow flexcenter">
            <h3>{{ group.name }}</h3>
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
                  <tr>                               
                    <td>{{ ordinalSuffix(index + 1) }}</td>
                    <td>{{ team.name }}</td>
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
      statistics: undefined
    }
  },
  created () {    
    this.getStatistics(this.$route.params.id)
  },
  methods:
  {
    getStatistics: function(id)
    {
      var _this = this
      _this.loading = true
      _this.tournament = undefined

      oboe('/data/tournament/' + id + '/statistics')      
      .done(function(statistics)
      {
        console.log('Loaded statistics for ' + id);        
        _this.statistics = statistics
        _this.loading = false
      })
      .fail(function (error) {
        console.log(error);        
        _this.loading = false
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
    }
  }   
};