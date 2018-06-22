import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';

import reducer from './reducer';

const { __initialState } = window;

const middleware = applyMiddleware(thunkMiddleware);

export default createStore(reducer, __initialState, middleware);
