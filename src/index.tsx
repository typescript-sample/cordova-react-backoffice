import * as FontFaceObserver from 'fontfaceobserver';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, HashRouter} from 'react-router-dom';
import {App} from './App';
import './assets/css/styles.scss';
import './assets/fonts/font-awesome-4.7.0/css/font-awesome.min.css';
import './assets/fonts/material-icon/css/material-icons.css';
import './assets/fonts/Roboto/font.css';
import {store} from './core/store';
import './index.css';
import {unregister} from './registerServiceWorker';

const Roboto800 = new FontFaceObserver('Roboto', { weight: 800 });
const Roboto500 = new FontFaceObserver('Roboto', { weight: 500 });
const Roboto400 = new FontFaceObserver('Roboto', { weight: 400 });
const Roboto300 = new FontFaceObserver('Roboto', { weight: 300 });
const Roboto100 = new FontFaceObserver('Roboto', { weight: 100 });

Promise.all([Roboto800.load(), Roboto400.load(), Roboto500.load(), Roboto300.load(), Roboto100.load()]).then(() => {
  }, () => {
});

const renderReactDom = () => {
  ReactDOM.render(
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>,
    document.getElementById('root') as HTMLElement
  );
};
// @ts-ignore: Unreachable code error
if (window.cordova) {
  document.addEventListener('deviceready', () => {
    renderReactDom();
  }, false);
} else {
  renderReactDom();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
unregister();
