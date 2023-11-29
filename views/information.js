export const information = {
  template: `
<div class="mainmargin">
  <div v-if="loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  <div v-else-if="tournament" class="flexcolumn">     
    <div class="flexrow">
      <div class="tournamentheader">          
        <h2>{{ tournament.name }}</h2>
        <div class="flexrow flexcenter menurow">          
          <router-link :to="'/' + tournament.id.value"><svg class="linkbutton"><use xlink:href="/html/icons.svg/#list"></use></svg></router-link>
          &nbsp;
          <router-link :to="'/statistics/' + tournament.id.value"><svg class="linkbutton"><use xlink:href="/html/icons.svg/#trophy"></use></svg></router-link>
          &nbsp;
          <router-link :to="'/playerstatistics/' + tournament.id.value"><svg class="linkbutton"><use xlink:href="/html/icons.svg/#chart"></use></svg></router-link>
          &nbsp;
          <svg class="selectedbutton"><use xlink:href="/html/icons.svg/#info"></use></svg>        
        </div>                
      </div>        
    </div>    
    <p>
      <div style="white-space: pre-wrap;">{{ tournament.info }}</div>
    </p>   
  </div>
  <div v-else>
    <p>Oops. Something went wrong.</p>  
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
    this.refresh();
  },
  methods:
  {
    refresh: function() {
      this.getTournament(this.$route.params.id)
    },    
    getTournament: function(id)
    {
      var _this = this
      _this.loading = true
      _this.tournament = undefined

      oboe({
        method: 'GET',
        url: '/data/tournament/' + id
      })      
      .done(function(tournament)
      {
        console.log('Loaded info for ' + id);        
        _this.tournament = tournament;
        _this.loading = false;
      })
      .fail(function (error) {
        console.log(error);        
        _this.loading = false;
      });
    }
  }   
};