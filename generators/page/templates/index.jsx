import React from 'react';
import { Provider, connect } from 'react-redux';
import ReactDOM from 'react-dom';
import Container from './Container';
import store from './store';
import action from './action_creators';
import './index.scss';

const Main = connect((state) => {
  return state || {};
}, action)(Container);

function init() {
  ReactDOM.render(
    <Provider store={store}>
      <Main />
    </Provider>,
    document.querySelector('#react-body')
  );
}

init();
