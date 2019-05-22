export const textEditor = {
  template: `
<div id="textEditor" class="modalbackground">
  <div class="modalpopup card">
    <div class="flexcolumn">            
      <p>Enter Text: </p>
      <input v-model="text" type="text"/>      
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
  props: ['text', 'onSave'],
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
      this.onSave(this.text);
    },
    cancel: function() {
      this.removeEditor()
    },
    removeEditor() {      
      var element = document.getElementById('textEditor');
      element.parentNode.removeChild(element);
    }
  }    
};