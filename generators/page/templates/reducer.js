/**
 * reducer 总入口
 * 如果 reducer 文件太大，建议分成多个小的 reducer
 */

// import {
// } from './const';

function reducer(state = {}, action) {
  let newState;

  switch (action.type) {
    /* process action here */
    default:
      break;
  }

  return newState || state;
}

module.exports = reducer;
