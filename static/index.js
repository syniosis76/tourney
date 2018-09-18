import {cities} from '/static/cities.js';
import {about} from '/static/about.js';

const routes = [
  { path: '/cities', component: cities },
  { path: '/about', component: about }
]

const router = new VueRouter({ routes })

const app = new Vue({ router })
app.$mount('#app')

router.push('cities')


