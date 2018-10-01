import '/html/vueDateTimeFormat.js';
import {tournaments} from '/views/tournaments.js';
import {tournament} from '/views/tournament.js';
import {tournamentEdit} from '/views/tournamentEdit.js';
import {draw} from '/views/draw.js';
import {about} from '/views/about.js';

const routes = [
  { path: '/', component: tournaments },
  { path: '/tournaments', component: tournaments },
  { path: '/tournament/:id', component: tournament },
  { path: '/tournament/edit/:id', component: tournamentEdit },
  { path: '/about', component: about }
]

const router = new VueRouter({ routes })

Vue.component('draw', draw)

const app = new Vue({ router })

app.$mount('#app')