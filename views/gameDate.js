export const gameDate = {
  template: `
<div class="fixedleft flexrow flexcenter">
    <h2>{{ gameDate.date.value | formatDayOfYear }}</h2>
    <div class="dropdown">
      <svg v-on:click="localShowDropdown($event, 'gameDateDropdown' + gameDate.id.value)" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>      
      <div :id="'gameDateDropdown' + gameDate.id.value" class="dropdown-content">
        <a v-on:click="deleteDate(gameDate.id.value)">Delete Date</a>
        <a v-on:click="addPitch(gameDate.id.value)">Add Pitch</a>
        <a v-on:click="deleteLastPitch(gameDate.id.value)">Delete Last Pitch</a>
      </div>
    </div>
</div>          
`,
  props: ['tournament', 'gameDate'],
  data () {
    return {
      loading: false,
    }
  },
  created () {
    
  },
  methods:
  {
    deleteDate: function(dateId)
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        console.log('Delete date', dateId)
          oboe({
            method: 'DELETE',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + dateId                   
        })
        .done(function(tournament)
        {
          _this.$router.go(0)
        })
        .fail(function (error) {
          console.log(error);        
          alert('Unable to delete date.')
        });
      }
    },
    addPitch: function(dateId)
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        console.log('Add Pitch for ', _this.tournament.name)
        oboe({
            method: 'PUT',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + dateId + '/pitch'                   
        })
        .done(function(tournament)
        {
          _this.$router.go(0)
        })
        .fail(function (error) {
          console.log(error);        
          alert('Unable to add Pitch.')
        });
      }
    },
    deleteLastPitch: function(dateId)
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        console.log('Delete Pitch for ', _this.tournament.name)
          oboe({
            method: 'DELETE',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + dateId + '/pitch'                   
        })
        .done(function(tournament)
        {
          _this.$router.go(0)
        })
        .fail(function (error) {
          console.log(error);        
          alert('Unable to add Pitch.')
        });
      }
    },
    localShowDropdown: function(event, name) {
      showDropdown(event, name)
    }
  }    
};