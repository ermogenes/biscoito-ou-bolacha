import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

import Router from 'vanilla-router';

import './index.scss';
import './results.scss';

import startPageMarkup from './start.html';
import resultsPageMarkup from './results.html';
import userPageMarkup from './user.html';
import configPageMarkup from './config.html';

// Objetos globais

const app = initializeApp({
  apiKey: 'AIzaSyBCt2DDVqDSBatSX0vZ0AE_VTGXXHmg4uE',
  authDomain: 'biscoito-ou-bolacha.firebaseapp.com',
  projectId: 'biscoito-ou-bolacha',
  storageBucket: 'biscoito-ou-bolacha.appspot.com',
  messagingSenderId: '494529657538',
  appId: '1:494529657538:web:08b4dc23a1c9edb354995b',
  measurementId: 'G-9YQZ9JT5DE',
});

const appRouter = new Router({
  mode: 'history',
  root: '/',
});

// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
const db = getFirestore();
const auth = getAuth(app);

let user;

const contentElement = document.getElementById('content');

// UI helpers

const hideLoginControls = () => {
  contentElement.querySelectorAll('.logado').forEach((el) => {
    const elemento = el;
    elemento.style.display = 'none';
  });
  contentElement.querySelectorAll('.nao-logado').forEach((el) => {
    const elemento = el;
    elemento.style.display = 'none';
  });
};

const loadSpinner = (show = true) => {
  contentElement.querySelectorAll('.carregando-auth').forEach((el) => {
    const elemento = el;
    elemento.style.display = show ? 'block' : 'none';
  });
  hideLoginControls();
};

const showLogged = (show = true) => {
  if (show) {
    contentElement.querySelectorAll('.logado').forEach((el) => {
      const elemento = el;
      elemento.style.display = 'block';
    });
    contentElement.querySelectorAll('.nao-logado').forEach((el) => {
      const elemento = el;
      elemento.style.display = 'none';
    });
  } else {
    contentElement.querySelectorAll('.logado').forEach((el) => {
      const elemento = el;
      elemento.style.display = 'none';
    });
    contentElement.querySelectorAll('.nao-logado').forEach((el) => {
      const elemento = el;
      elemento.style.display = 'block';
    });
  }
};

const updateAuthControls = () => {
  const knownState = user !== undefined;

  loadSpinner(!knownState);
  if (knownState) showLogged(user);
};

// Autenticação

const googleRedirectLogin = (event) => {
  event.preventDefault();
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
};

const logout = (event) => {
  event.preventDefault();
  signOut(auth);
};

// Navegação

const handleNavigate = (event) => {
  event.preventDefault();
  const url = new URL(event.currentTarget.href);
  appRouter.navigateTo(url.pathname);
};

const updateListeners = () => {
  const links = contentElement.querySelectorAll('a.route');
  links?.forEach((a) => {
    a.addEventListener('click', handleNavigate);
  });

  const loginGoogle = contentElement.querySelector('.login-google');
  loginGoogle?.addEventListener('click', googleRedirectLogin);

  const logoutButton = contentElement.querySelector('.logout');
  logoutButton?.addEventListener('click', logout);
};

const show = (markup) => {
  contentElement.innerHTML = markup;
  updateListeners();
};

// Serviços

const getResults = async () => {
  const docRef = doc(db, 'results', '1');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
};

// Páginas

const showStartPage = () => {
  show(startPageMarkup);
  updateAuthControls(user);
};

const showUserPage = () => {
  if (user) {
    show(userPageMarkup);
  }
};

const showConfigPage = () => {
  if (user) {
    show(configPageMarkup);
  }
};

const showResultsPage = () => {
  getResults().then((dados) => {
    const resultado = {};
    resultado.biscoito = dados.biscoito / (dados.biscoito + dados.bolacha);
    resultado.bolacha = 1 - resultado.biscoito;
    resultado.biscoito100 = Number.parseFloat(resultado.biscoito * 100);
    resultado.bolacha100 = Number.parseFloat(resultado.bolacha * 100);

    show(resultsPageMarkup);

    const biscoitoPercentual = contentElement.querySelector(
      '#biscoito .percentual'
    );
    const bolachaPercentual = contentElement.querySelector(
      '#bolacha .percentual'
    );

    biscoitoPercentual.innerHTML = `${resultado.biscoito100.toFixed(1)}%`;
    bolachaPercentual.innerHTML = `${resultado.bolacha100.toFixed(1)}%`;

    const biscoito = contentElement.querySelector('#biscoito');
    const bolacha = contentElement.querySelector('#bolacha');

    biscoito.style.fontSize = `${1 + resultado.biscoito}em`;
    bolacha.style.fontSize = `${1 + resultado.bolacha}em`;

    biscoito.classList.add('vencedor');
    bolacha.classList.add('vencedor');
    if (resultado.biscoito > resultado.bolacha) {
      bolacha.classList.remove('vencedor');
    }
    if (resultado.bolacha > resultado.biscoito) {
      biscoito.classList.remove('vencedor');
    }
  });
};

const show404 = () => {
  show('404');
};

// Inicialização

appRouter
  .add('/', showStartPage)
  .add('/user', showUserPage)
  .add('/config', showConfigPage)
  .add('/results', showResultsPage)
  .add(':any', show404)
  .addUriListener()
  .navigateTo('/');

document.addEventListener('DOMContentLoaded', () => {
  updateAuthControls();

  onAuthStateChanged(auth, (loggedUser) => {
    user = loggedUser;
    updateAuthControls();
  });

  updateListeners();
});
