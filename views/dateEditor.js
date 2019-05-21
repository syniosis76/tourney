export const dateEditor = {
  template: `
<div id="dateEditor" class="modalbackground">
  <div class="modalpopup card">
    <div class="flexcolumn">            
      <p>Enter Date: </p>
      <input v-model="date" type="date"/>      
      <br/>
      <div class="flexrow flexright">
        <a v-on:click="save">Save</a>
        &nbsp;&nbsp;
        <a v-on:click="cancel">Cancel</a>
      </div>
    </div>
  </div>
</div>
`,
  props: ['date', 'onSave'],
  data () {
    return {
      loading: false
    }
  },
  created () {    
    
  },
  methods:
  {
    save: function() {      
      this.removeEditor();     
      this.onSave(this.date);
    },
    cancel: function() {
      this.removeEditor()
    },
    removeEditor() {      
      var element = document.getElementById('dateEditor');
      element.parentNode.removeChild(element);
    }
  }    
};