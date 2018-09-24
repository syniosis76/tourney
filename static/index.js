import {tournaments} from '/static/tournaments.js';
import {about} from '/static/about.js';
import '/static/vueDateTimeFormat.js';

const routes = [
  { path: '/tournaments', component: tournaments },
  { path: '/about', component: about }
]

const router = new VueRouter({ routes })

const app = new Vue({ router })
app.$mount('#app')

router.push('tournaments')