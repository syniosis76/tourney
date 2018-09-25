import '/html/vueDateTimeFormat.js';
import {tournaments} from '/views/tournaments.js';
import {about} from '/views/about.js';

const routes = [
  { path: '/tournaments', component: tournaments },
  { path: '/about', component: about }
]

const router = new VueRouter({ routes })

const app = new Vue({ router })
app.$mount('#app')

router.push('tournaments')