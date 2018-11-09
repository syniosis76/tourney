export const gameDate = {
  template: `
<div>
  <div class="flexrow">
    <div class="fixedleft gamedateheader flexrow flexcenter">
      <h2>{{ gameDate.date.value | formatDayOfYear }}</h2>
      <div v-if="tournament.canEdit" class="dropdown">
        <svg v-on:click="localShowDropdown($event, 'gameDateDropdown' + gameDate.id.value)" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>      
        <div :id="'gameDateDropdown' + gameDate.id.value" class="dropdown-content">
          <a v-on:click="deleteDate(gameDate.id.value)">Delete Date</a>
          <a v-on:click="addPitch(gameDate.id.value)">Add Pitch</a>
          <a v-on:click="deleteLastPitch(gameDate.id.value)">Delete Last Pitch</a>
        </div>
      </div>
    </div>  
  </div>          
  <div v-if="gameDate.pitches" class="flexrow">
    <div class="fixedleft flexrow leftdividercontainer" style="z-index: 1000">
      <div class="leftdivider"></div>
      <div class="card">      
        <div class="cardheader"></div>
        <table id="game-times" class="selectable">
          <thead>
            <tr><th>Time</th></tr>
          </thead>
          <tbody>
            <template v-if="maxGameCount() > 0">
              <template v-for="(value, index) in maxGameCount()">
                <tr v-on:click="selectGame($event)" v-on:mouseover="hoverGame($event)" v-on:mouseout="hoverGame(null)" :class="{ trselected: index === gameDate.selectedIndex, trhover: index === gameDate.hoverIndex }">  
                  <td>{{ getGameTime(index) }}</td>
                </tr>
              </template>
            </template>
          </tbody>    
        </table>
      </div>
    </div>
    <div class="flexrow">
      <div v-for="pitch in gameDate.pitches.data">
        <pitch :tournament="tournament" :gameDate="gameDate" :pitch="pitch"></pitch>
      </div>
      <div class="endspacer"></div>
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
    refresh: function() {
      this.$parent.refresh();
    },
    deleteDate: function(dateId)
    {
      var _this = this
      if (_this.tournament != undefined)
      {
        if (confirm("Are you sure you want to delete this date?")) {
          console.log('Delete date', dateId)
          oboe({
              method: 'DELETE',
              url: '/data/tournament/' + _this.tournament.id.value + '/date/' + dateId                   
          })
          .done(function(tournament)
          {
            _this.refresh();
          })
          .fail(function (error) {
            console.log(error);        
            alert('Unable to delete date.');
          });
        }
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
          _this.refresh();
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
        if (confirm("Are you sure you want to delete the last pitch?")) {
          console.log('Delete Pitch for ', _this.tournament.name)
          oboe({
              method: 'DELETE',
              url: '/data/tournament/' + _this.tournament.id.value + '/date/' + dateId + '/pitch'                   
          })
          .done(function(tournament)
          {
            _this.refresh();
          })
          .fail(function (error) {
            console.log(error);        
            alert('Unable to add Pitch.')
          });
        }
      }
    },
    localShowDropdown: function(event, name) {
      showDropdown(event, name)
    },
    maxGameCount: function()
    {
      var count = 0;
      this.gameDate.pitches.data.forEach(pitch => {
        if (pitch.games.data.length > count) count = pitch.games.data.length;
      });
      return count;
    },
    selectGame: function(event) {
      var index = event.currentTarget.rowIndex;      
      Vue.set(this.gameDate, 'selectedIndex', index - 1);    
    },
    hoverGame: function(event) {
      var index = 0;
      if (event) index = event.currentTarget.rowIndex;
      Vue.set(this.gameDate, 'hoverIndex', index - 1);
    },
    getGameTime: function(index) {
      var startMinute = 8 * 60;
      
      var currentMinute = startMinute + (index * 24);
      var hour = Math.floor(currentMinute / 60);
      var minute = currentMinute % 60;
      hour = hour < 10 ? '0' + hour : hour;
      minute = minute < 10 ? '0' + minute : minute;
      return hour + ':' + minute;
    }
  }    
};