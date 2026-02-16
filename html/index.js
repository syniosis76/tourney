import {toolbar} from '/views/toolbar.js';
import {tournaments} from '/views/tournaments.js';
import {tournament} from '/views/tournament.js';
import {tournamentEdit} from '/views/tournamentEdit.js';
import {gameDate} from '/views/gameDate.js';
import {pitch} from '/views/pitch.js';
import {players} from '/views/players.js';
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
  { path: '/', name: 'tournaments-home', component: tournaments },
  { path: '/tournaments', name: 'tournaments', component: tournaments },  
  { path: '/tournament/:id', name: 'tournament-x', component: tournament },
  { path: '/tournament/:id/edit', name: 'tournament-edit', component: tournamentEdit },
  { path: '/statistics/:id', name: 'statistics', component: statistics },
  { path: '/playerstatistics/:id', name: 'playerstatistics', component: playerStatistics },
  { path: '/players/:id', name: 'players', component: players },
  { path: '/information/:id', name: 'information', component: information },
  { path: '/login', name: 'login', component: login },
  { path: '/about', name: 'about', component: about },
  { path: '/:id', name: 'tournament', component: tournament }
]

const history = VueRouter.createWebHashHistory()
const router = VueRouter.createRouter({ routes: routes, history: history })

var googleUser = new GoogleUser();
googleUser.appStart();

var data = {};
data.searchText = '';

const app = Vue.createApp({ data: function () { return data; } });

app.component('toolbar', toolbar)
app.component('gameDate', gameDate)
app.component('pitch', pitch)
app.component('gameEditor', gameEditor)
app.component('dateEditor', dateEditor)
app.component('textEditor', textEditor)
app.component('loginUser', loginUser)

app.use(router);

app.config.globalProperties.$googleUser = googleUser;
app.config.compilerOptions.whitespace = 'codense'

app.mount('body');