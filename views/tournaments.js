export const tournaments = {
  template: `
<div class="fullwidth mainmargin">  
  <div>
    <input v-model="searchTerm" placeholder=" search" class="tournamentsearchinput" @keyup="searchChange($event)"/>
</div>
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>  
  <div v-else>
    <table id="tournaments" class="card fullwidth maxwidthmedium spacious selectable">
    <thead>
      <tr>
        <th>Tournament</th>
        <th>Date</th>            
      </tr>
    </thead>
    <tbody>
      <template v-for="tournament in tournaments">
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
      <p>&nbsp;&nbsp;<a v-on:click="loadMoreYears()">Load {{ nextYear }}</a></p>
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
      loadedYears: []
    }
  },
  computed: {
    showLoadMore: function() {
      if (this.searchTerm) return false;
      return this.loadedYears.length < this.availableYears.length;
    },
    nextYear: function() {
      for (let year of this.availableYears) {
        if (!this.loadedYears.includes(year)) {
          return year;
        }
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
      
      if (_this.searchTerm) {
        url += '&all=true';
      } else if (append && _this.loadedYears.length > 0) {
        url += '&year=' + _this.nextYear;
      }

      oboe({
        method: 'GET',
        url: url,                    
        headers: this.$googleUser.headers
      })         
      .done(function(data)
      {
        if (append && _this.loadedYears.length > 0) {
          data.tournaments.forEach(element => {
            _this.tournaments.push(element);
          });
        } else {
          _this.tournaments = [];
          data.tournaments.forEach(element => {
            _this.tournaments.push(element);
          });
        }
        _this.canEdit = data.canEdit;
        _this.availableYears = data.availableYears || [];
        _this.loadedYears = data.loadedYears || [];
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