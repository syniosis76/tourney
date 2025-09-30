export const toolbar = {
  template: `
<div>
  <div class="flexrow">      
    <div class="tournamentheader fixedleft">
      <a :href="tournament.webSite" v-if="tournament.webSite" target="_blank" class="darklink">
        <img class="tournamentbanner" v-if="tournamentBanner" v-bind:src="'data:image/png;base64,' + tournamentBanner"/>
        <h2 v-else>{{ tournament.name }}</h2>
      </a>
      <template v-else>
        <img class="tournamentbanner" v-if="tournamentBanner" v-bind:src="'data:image/png;base64,' + tournamentBanner"/>
        <h2 v-else>{{ tournament.name }}</h2>        
      </template>
      <div class="flexrow flexcenter menurow">                                        
        <router-link :to="'/' + tournament_id"><svg :class="{ selectedbutton : $route.name === 'tournament', linkbutton : $route.name != 'tournament' }"><use xlink:href="/html/icons.svg/#list"></use></svg></router-link>        
        &nbsp;
        <router-link :to="'/statistics/' + tournament_id"><svg :class="{ selectedbutton : $route.name === 'statistics', linkbutton : $route.name != 'statistics' }"><use xlink:href="/html/icons.svg/#trophy"></use></svg></router-link>
        &nbsp;          
        <router-link :to="'/playerstatistics/' + tournament_id"><svg :class="{ selectedbutton : $route.name === 'playerstatistics', linkbutton : $route.name != 'playerstatistics' }"><use xlink:href="/html/icons.svg/#chart"></use></svg></router-link>
        &nbsp;
        <router-link :to="'/information/' + tournament_id"><svg :class="{ selectedbutton : $route.name === 'information', linkbutton : $route.name != 'information' }"><use xlink:href="/html/icons.svg/#info"></use></svg></router-link>
        &nbsp;
        <input v-model="$root.$data.searchText" placeholder="search" style="width: 150px"/>
        <div v-if="tournament.canEdit" class="dropdown">          
          <svg onclick="showDropdown(event, 'tournamentDropdown')" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>
          <div id="tournamentDropdown" class="dropdown-content">              
            <router-link :to="'/tournament/' + tournament_id + '/edit'">Edit Tournament Details</router-link>
            <a v-on:click="addDate">Add Date</a>
            <router-link :to="'/players/' + tournament_id">Players</router-link>
            <a v-on:click="deleteTournament">Delete Tournament</a>                            
          </div>
        </div>
      </div>
    </div>  
  </div>
</div>
`,
  props: ['tournament'],
  data () {
    return {
      loading: false,
      tournament_id: this.get_tournament_id()
    }
  },
  created () {
    
  },
  methods:
  {
    refresh: function() {
      this.$parent.refresh();
    },
    get_tournament_id: function() {
      if (Object.hasOwn(this.tournament.id, 'value')) {
          return this.tournament.id.value;
      }
      else {
        return this.tournament.id;
      }
    }
  },  
};