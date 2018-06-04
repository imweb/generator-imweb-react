import {createStore, applyMiddleware} from 'redux';

import thunkMiddleware from 'redux-thunk';

import reducer from './reducer';

let __initialState = window.__initialState;

let middleware = applyMiddleware(thunkMiddleware);

export default createStore(reducer, __initialState, middleware);
