export const textEditor = {
  template: `
<div id="textEditor" class="modalbackground">
  <div class="modalpopup card">
    <div class="flexcolumn">            
      <p>Enter Text: </p>
      <input v-model="editText" type="text"/>      
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
      loading: false,
      editText: this.text + ''
    }
  },
  created () {    
    
  },
  methods:
  {
    save: function() {      
      this.removeEditor();     
      this.onSave(this.editText);
    },
    cancel: function() {
      this.removeEditor()
    },
    removeEditor() {      
      this.$.appContext.app.unmount();
    }
  }    
};