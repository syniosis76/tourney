export const gameDate = {
  template: `
<div class="fixedleft">
    {{ gameDate.date.value | formatDay }}                
    | <a v-on:click="deleteDate(gameDate.id.value)">Delete Date</a>
    | <a v-on:click="addPitch(gameDate.id.value)">Add Pitch</a>
</div>          
`,
  props: ['gameDate'],
  data () {
    return {
      loading: false,
    }
  },
  created () {
    
  },
  methods:
  {
    
  }    
};