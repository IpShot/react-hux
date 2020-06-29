import { useReducer, useRef } from 'react';

const dock = {};

function getHux(storeName, reducer) {
  // ? mergeReducers(storeName, reducer);
  return dock[storeName].current;
}

function subscribe(storeName, data) {

}

function share(storeName, data) {
  dock[storeName].current.shared = {
    ...data,
    ...dock[storeName].current.shared,
  }
}

function createStore(storeName, reducer, initialState) {
  const [state, dispatch] = useReducer(reducer, initialState);
  dock[storeName] = useRef({
    state,
    dispatch,
    share: share.bind(null, storeName),
    subscribe: subscribe.bind(null, storeName),
  });
  return dock[storeName];
}

function createHux(storeName, reducer, initialState) {
  dock[storeName] = createStore(storeName, reducer, initialState);
  return dock[storeName].current;
}

export function useHux(storeName, reducer, initialState) {
  if (!storeName) throw new Error('You have to specify a store name.');
  if (initialState) {
    return createHux(storeName, reducer, initialState);
  } else if (!dock[storeName]) {
    throw new Error(`This is the ${storeName} init, you have to specify reducer and initial state.`);
  } else {
    return getHux(storeName, reducer);
  }
}
