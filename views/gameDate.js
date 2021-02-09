import {dateEditor} from '/views/dateEditor.js';

export const gameDate = {
  template: `
<div>
  <div class="flexrow">
    <div class="fixedleft gamedateheader flexrow flexcenter">
      <h3>{{ gameDate.date.value | formatDayOfYear }}</h3>
      <div v-if="tournament.canEdit" class="dropdown">
        <svg v-on:click="localShowDropdown($event, 'gameDateDropdown' + gameDate.id.value)" class="dropdown-button"><use xlink:href="/html/icons.svg/#menu"></use></svg>      
        <div :id="'gameDateDropdown' + gameDate.id.value" class="dropdown-content">          
        <a v-on:click="editDate()">EditDate</a>
          <a v-on:click="addPitch(gameDate.id.value)">Add Pitch</a>
          <a v-on:click="deleteLastPitch(gameDate.id.value)">Delete Last Pitch</a>
          <a v-on:click="pasteGameTimes()">Paste Game Times</a>
          <a v-on:click="deleteDate(gameDate.id.value)">Delete Date</a>
        </div>
      </div>
    </div>  
  </div>          
  <div v-if="gameDate.pitches" class="flexrow">
    <div class="fixedleft flexrow leftdividercontainer" style="z-index: 1000">
      <div class="card">      
        <div class="cardheader"></div>
        <table id="game-times" class="selectable">
          <thead>
            <tr><th>Time</th></tr>
          </thead>
          <tbody>
            <template v-if="maxGameCount() > 0">
              <template v-for="(value, index) in maxGameCount()">
                <tr v-on:click="selectGame($event)" v-on:mouseover="hoverGame($event)" v-on:mouseout="hoverGame(null)" :class="{ trselected: index === gameDate.selectedIndex, trhover: index === gameDate.hoverIndex, searchrow: rowSearchMatches(index, $root.$data.searchText) }">  
                  <td><template v-if="gameDate.gameTimes && gameDate.gameTimes.length > index">{{ gameDate.gameTimes[index] }}</template></td>
                </tr>
              </template>
            </template>
          </tbody>    
        </table>
      </div>
    </div>
    <div class="flexrow">
      <div v-for="pitch in gameDate.pitches">
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
    sendData: function(route, data, refresh) {
      var _this = this
      if (_this.gameDate)
      {
        oboe({
            method: 'PUT',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + (route ? '/' + route : ''),
            body: data
        })
        .done(function(tournament)
        {
          if (refresh)
          {
            _this.refresh();
          }
        })
        .fail(function (error) {
          console.log(error);        
          alert('Oops. Something went wrong.')
        });      
      }
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
    pasteGameTimes: function()
    {
      var _this = this
      navigator.clipboard.readText()
      .then(clipboardText => {        
        var data = { "clipboardText": clipboardText};
        oboe({
            method: 'PUT',
            url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/times/paste',
            body: data
        })
        .done(function()
        {
          _this.refresh();
        })
        .fail(function (error) {
          console.log(error);        
          alert('Unable to paste game times')
        });
      })
      .catch(error => {
        alert('Error reading from the clipboard:\n  ' + error.message + '\nCheck the site settings from the url bar.');
      });                   
    },
    editDate: function() {
      // Remove existing editor
      var element = document.getElementById('dateEditor');
      if (element) element.parentNode.removeChild(element);

      if (this.tournament.canEdit) {
        var _this = this;
        var ComponentClass = Vue.extend(dateEditor)
        var instance = new ComponentClass({
            propsData: { date: _this.gameDate.date.value.substring(0, 10)
                , onSave:  function(date) {
              var data = { 'date': { _type: 'datetime', value: date } };
              _this.sendData(null, data, true);
            }}
        });      
        instance.$mount(); // pass nothing  
        document.body.appendChild(instance.$el);
      }
    },
    localShowDropdown: function(event, name) {
      showDropdown(event, name)
    },
    maxGameCount: function()
    {
      var count = 0
      if (this.gameDate.gameTimes && this.gameDate.gameTimes) {
        count = this.gameDate.gameTimes.length
      };
      this.gameDate.pitches.forEach(pitch => {
        if (pitch.games.length > count) count = pitch.games.length;
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
    searchMatches: function(text, searchText) {
      if (text && searchText) {
        let lowerText = text.toLowerCase();
        let lowerSearchText = searchText.toLowerCase();
        return lowerText === lowerSearchText || (lowerSearchText.length >= 3 && lowerText.includes(lowerSearchText));
      }
      return false;
    },
    rowSearchMatches: function(index, searchText) {
      if (searchText) {
        for (let pitch of this.gameDate.pitches) {
          let game = pitch.games[index];
          if (game) {
            if (this.searchMatches(game.group, searchText)) return true;
            if (this.searchMatches(game.team1, searchText)) return true;
            if (this.searchMatches(game.team2, searchText)) return true;
            if (this.searchMatches(game.dutyTeam, searchText)) return true;        
          }
        }
      }
      return false;
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