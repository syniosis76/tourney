import '/html/vueDateTimeFormat.js';
import '/html/tourneyUtilities.js';
import {tournaments} from '/views/tournaments.js';
import {tournament} from '/views/tournament.js';
import {tournamentEdit} from '/views/tournamentEdit.js';
import {gameDate} from '/views/gameDate.js';
import {pitch} from '/views/pitch.js';
import {gameEditor} from '/views/gameEditor.js';
import {about} from '/views/about.js';

const routes = [
  { path: '/', component: tournaments },
  { path: '/tournaments', component: tournaments },
  { path: '/tournament/:id', component: tournament },
  { path: '/tournament/:id/edit', component: tournamentEdit },
  { path: '/about', component: about }
]

const router = new VueRouter({ routes })

Vue.component('gameDate', gameDate)
Vue.component('pitch', pitch)
Vue.component('gameEditor', gameEditor)

const app = new Vue({ router })

app.$mount('#app')