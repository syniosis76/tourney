import '/html/vueDateTimeFormat.js';
import {tournaments} from '/views/tournaments.js';
import {tournament} from '/views/tournament.js';
import {about} from '/views/about.js';

const routes = [
  { path: '/', component: tournaments },
  { path: '/tournaments', component: tournaments },
  { path: '/tournament/:id', component: tournament },
  { path: '/about', component: about }
]

const router = new VueRouter({ routes })

const app = new Vue({ router })
app.$mount('#app')