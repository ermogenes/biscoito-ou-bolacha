/* eslint-disable no-param-reassign */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

import Router from 'vanilla-router';

import './index.scss';

import startPageMarkup from './start.html';
import resultsPageMarkup from './results.html';
import './results.scss';

const app = initializeApp({
  apiKey: 'AIzaSyBCt2DDVqDSBatSX0vZ0AE_VTGXXHmg4uE',
  authDomain: 'biscoito-ou-bolacha.firebaseapp.com',
  projectId: 'biscoito-ou-bolacha',
  storageBucket: 'biscoito-ou-bolacha.appspot.com',
  messagingSenderId: '494529657538',
  appId: '1:494529657538:web:08b4dc23a1c9edb354995b',
  measurementId: 'G-9YQZ9JT5DE',
});

// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
const db = getFirestore();

const getResults = async () => {
  const docRef = doc(db, 'results', '1');
  const docSnap = await getDoc(docRef);
  console.log(docSnap.data());
  return docSnap.exists() ? docSnap.data() : {};
};

const appRouter = new Router({
  mode: 'history',
  root: '/',
});

const contentElement = document.getElementById('content');

const handleNavigate = (event) => {
  event.preventDefault();
  const url = new URL(event.currentTarget.href);
  appRouter.navigateTo(url.pathname);
};

const updateListeners = () => {
  contentElement.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', handleNavigate);
  });
};

const show = (markup) => {
  contentElement.innerHTML = markup;
  updateListeners();
};

const showStartPage = () => {
  show(startPageMarkup);
};

const showLoginPage = () => {
  show('login');
};

const showResultsPage = () => {
  getResults().then((dados) => {
    const resultado = {};
    resultado.biscoito = dados.biscoito / (dados.biscoito + dados.bolacha);
    resultado.bolacha = 1 - resultado.biscoito;
    resultado.biscoito100 = Number.parseFloat(resultado.biscoito * 100);
    resultado.bolacha100 = Number.parseFloat(resultado.bolacha * 100);

    show(resultsPageMarkup);

    const biscoitoPercentual = document.querySelector('#biscoito .percentual');
    const bolachaPercentual = document.querySelector('#bolacha .percentual');
    console.log('biscoito', biscoitoPercentual);
    console.log('bolacha', bolachaPercentual);

    biscoitoPercentual.innerHTML = `${resultado.biscoito100.toFixed(1)}%`;
    bolachaPercentual.innerHTML = `${resultado.bolacha100.toFixed(1)}%`;

    const biscoito = document.querySelector('#biscoito');
    const bolacha = document.querySelector('#bolacha');

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

appRouter
  .add('/', showStartPage)
  .add('/login', showLoginPage)
  .add('/results', showResultsPage)
  .add(':any', show404)
  .addUriListener()
  .navigateTo('/');
