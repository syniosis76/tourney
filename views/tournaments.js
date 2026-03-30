export const tournaments = {
  template: `
<div class="fullwidth mainmargin">  
  <div>
    <input v-model="searchTerm" placeholder=" search" class="tournamentsearchinput" @keyup="searchChange($event)"/>
</div>
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>  
  <div>
    <table id="tournaments" class="card fullwidth maxwidthmedium spacious selectable">
    <thead>
      <tr>
        <th>Tournament</th>
        <th>Date</th>            
      </tr>
    </thead>
    <tbody>
      <template v-for="tournament in tournaments" :key="tournament.id.value">
        <router-link :to="'/' + tournament.id.value" custom v-slot="{ navigate }">
          <tr @click="navigate" @keypress.enter="navigate" role="link">
            <td>{{ tournament.name }}</td>
            <td><div v-if="tournament.startDate">{{ new Date(tournament.startDate.value).toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" }).replaceAll(",", "") }}</div></td>
          </tr>
        </router-link>
      </template>
    </tbody>    
    </table>
    <template v-if="showLoadMore">
      <p id="loadMoreLink">&nbsp;&nbsp;<a v-on:click="loadMoreYears()">Load {{ nextYear }}</a></p>
    </template>
    <template v-if="canEdit">
      <p>&nbsp;&nbsp;<router-link to="/tournament/new/edit">Add</router-link></p>
    </template>
    <div class="footerspacer"></div>
  </div>
</div>
`,
  data () {
    return {
      loading: false,
      tournaments: [],
      searchTerm: '',
      canEdit: false,
      availableYears: [],
      thisYear: null
    }
  },
  computed: {
    sortedAvailableYears: function() {
      return [...this.availableYears].map(y => parseInt(y)).sort((a, b) => b - a);
    },
    showLoadMore: function() {
      if (this.searchTerm) return false;
      if (!this.thisYear || !this.sortedAvailableYears.length) return false;
      let minYear = this.sortedAvailableYears[this.sortedAvailableYears.length - 1];
      return this.thisYear > minYear;
    },
    nextYear: function() {
      if (!this.thisYear || !this.sortedAvailableYears.length) return null;
      let idx = this.sortedAvailableYears.indexOf(parseInt(this.thisYear));
      if (idx > 0) {
        return this.sortedAvailableYears[idx - 1];
      }
      return null;
    }
  },
  created () {
    this.getTournaments()
  },  
  methods:
  {
    refresh: function() {
      this.getTournaments();
    },
    searchChange: function(event) {
      this.refresh();
    },
    loadMoreYears: function() {
      this.getTournaments(true);
    },
    getTournaments: function(append = false) {
      var _this = this
      _this.loading = true

      let url = '/data/tournaments?searchTerm=' + _this.searchTerm;
      
      let yearToLoad = null;
      if (_this.searchTerm) {
        url += '&all=true';
      } else if (append && this.nextYear) {
        yearToLoad = this.nextYear;
        url += '&year=' + yearToLoad;
      }

      oboe({
        method: 'GET',
        url: url,                    
        headers: this.$googleUser.headers
      })         
      .done(function(data)
      {
        if (!(append && yearToLoad !== null)) {
          _this.tournaments = [];
        }
        data.tournaments.forEach(element => {
          _this.tournaments.push(element);
        });
        
        _this.canEdit = data.canEdit;
        _this.availableYears = data.availableYears || [];
        
        if (yearToLoad !== null) {
          _this.thisYear = parseInt(yearToLoad);
        } else if (_this.sortedAvailableYears.length > 0) {
          _this.thisYear = _this.sortedAvailableYears[0];
        }
        
        _this.loading = false;
      })
      .fail(function (error) {
        console.log(error);
        _this.loading = false
        _this.tournaments = 'Error!';
      });
    }
  }    
};