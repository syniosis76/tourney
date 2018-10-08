export const pitch = {
  template: `
<div class="pitch card">
  <div class="flexrow flexcenter">
    {{ pitch.name }}
    <div class="dropdown">
      <div v-on:click="localShowDropdown('pitchDropdown' + pitch.id.value)" class="dropdown-button"></div>
      <div :id="'pitchDropdown' + pitch.id.value" class="dropdown-content">        
        <a v-on:click="pasteGames">Paste Games</a>        
      </div>
    </div>
  </div>
</div>
`,
  props: ['tournament', 'gameDate', 'pitch'],
  data () {
    return {
      loading: false,
    }
  },
  created () {
    
  },
  methods:
  {
    pasteGames: function(pitchId)
    {
      var _this = this
      if (_this.pitch != undefined)
      {
        navigator.clipboard.readText()
        .then(clipboardText => {          
          console.log('Paste games for', _this.pitch.name, clipboardText);
          var data = { "mode": "append", "clipboardText": clipboardText};
          oboe({
              method: 'PUT',
              url: '/data/tournament/' + _this.tournament.id.value + '/date/' + _this.gameDate.id.value + '/pitch/' + _this.pitch.id.value,
              body: data
          })
          .done(function(tournament)
          {
            //_this.$router.go(0)
          })
          .fail(function (error) {
            console.log(error);        
            alert('Unable to paste games')
          });
        });        
      }
    },
    localShowDropdown: function(name) {
      showDropdown(name)
    }
  }    
};