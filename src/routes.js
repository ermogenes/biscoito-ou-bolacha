import Router from 'vanilla-router';

import StartPage from './pages/start/start';
import ResultsPage from './pages/results/results';
import LoginPage from './pages/login/login';

const appContent = document.getElementById('content');

const router = new Router({
  mode: 'history',
  root: '/',
});

const Routes = {
  router,

  handleNavigate(event) {
    event.preventDefault();
    const url = new URL(event.currentTarget.href);
    router.navigateTo(url.pathname);
  },

  show(content) {
    appContent.innerHTML = content;
    appContent.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', this.handleNavigate);
    });
  },

  start() {
    this.router
      .add('/', () => this.show(StartPage()))
      .add('/login', () => this.show(LoginPage()))
      .add('/results', () => this.show(ResultsPage()))
      .add(':any', () => this.show('404'))
      .addUriListener()
      .navigateTo('/');
  },
};

export default Routes;
