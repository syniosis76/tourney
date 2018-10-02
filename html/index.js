import '/html/vueDateTimeFormat.js';
import {tournaments} from '/views/tournaments.js';
import {tournament} from '/views/tournament.js';
import {tournamentEdit} from '/views/tournamentEdit.js';
import {pitch} from '/views/pitch.js';
import {about} from '/views/about.js';

const routes = [
  { path: '/', component: tournaments },
  { path: '/tournaments', component: tournaments },
  { path: '/tournament/:id', component: tournament },
  { path: '/tournament/:id/edit', component: tournamentEdit },
  { path: '/about', component: about }
]

const router = new VueRouter({ routes })

Vue.component('pitch', pitch)

const app = new Vue({ router })

app.$mount('#app')