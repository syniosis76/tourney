import {tournaments} from '/views/tournaments.js';
import {tournament} from '/views/tournament.js';
import {tournamentEdit} from '/views/tournamentEdit.js';
import {gameDate} from '/views/gameDate.js';
import {pitch} from '/views/pitch.js';
import {gameEditor} from '/views/gameEditor.js';
import {dateEditor} from '/views/dateEditor.js';
import {textEditor} from '/views/textEditor.js';
import {statistics} from '/views/statistics.js';
import {playerStatistics} from '/views/playerStatistics.js';
import {information} from '/views/information.js';
import {login} from '/views/login.js';
import {loginUser} from '/views/loginUser.js';
import {about} from '/views/about.js';
import {GoogleUser} from '/html/googleSignIn.js';

const routes = [
  { path: '/', component: tournaments },
  { path: '/tournaments', component: tournaments },  
  { path: '/tournament/:id', component: tournament },
  { path: '/tournament/:id/edit', component: tournamentEdit },
  { path: '/statistics/:id', component: statistics },
  { path: '/playerstatistics/:id', component: playerStatistics },
  { path: '/information/:id', component: information },
  { path: '/login', component: login },
  { path: '/about', component: about },
  { path: '/:id', component: tournament }
]

const history = VueRouter.createWebHashHistory()
const router = VueRouter.createRouter({ routes: routes, history: history })

var googleUser = new GoogleUser();
googleUser.appStart();

var data = {};
data.searchText = '';

const app = Vue.createApp({ data: function () { return data; } });

app.component('gameDate', gameDate)
app.component('pitch', pitch)
app.component('gameEditor', gameEditor)
app.component('dateEditor', dateEditor)
app.component('textEditor', textEditor)
app.component('loginUser', loginUser)

app.use(router);

app.config.globalProperties.$googleUser = googleUser;
app.config.compilerOptions.whitespace = 'codense'

app.mount('#app');