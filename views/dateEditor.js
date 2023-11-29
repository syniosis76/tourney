export const dateEditor = {
  template: `
<div id="dateEditor" class="modalbackground">
  <div class="modalpopup card">
    <div class="flexcolumn">            
      <p>Enter Date: </p>
      <input v-model="editDate" type="date"/>      
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
      loading: false,
      editDate: this.date + '' // Clone
    }
  },
  created () {    
    
  },
  methods:
  {
    save: function() {      
      this.removeEditor();     
      this.onSave(this.editDate);
    },
    cancel: function() {
      this.removeEditor()
    },
    removeEditor() {      
      this.$.appContext.app.unmount();
    }
  }    
};