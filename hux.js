import { useReducer, useRef, useMemo, useEffect } from 'react';
import shallowEqual from './shallowEqual';

let counter = 0;
const genId = () => counter++;
const dock = {};
const subscriptions = {};

function createSubscription(storeName, subId, data, update) {
  subscriptions[storeName][subId] = () => {
    const prevState = dock[storeName].state;
    const keys = Object.keys(data);
    keys.forEach(key => {
      if (prevState[key] !== data[key]) update();
    });
  }
}

function unsubscribe(storeName, id) {
  if (subscriptions[storeName] && subscriptions[storeName][id]) {
    delete subscriptions[storeName][id];
  }
}

function subscribe(storeName) {
  return (data) => {
    const subId = useRef(genId());
    const dataRef = useRef(data);
    const [_, forceRender] = useReducer(s => s + 1, 0);
    if (!shallowEqual(dataRef.current, data)) {
      dataRef.current = data;
    }
    useEffect(() => {
      createSubscription(
        storeName,
        subId.current,
        dataRef.current,
        forceRender
      );
      return () => unsubscribe(storeName, subId.current);
    }, [dataRef.current]);
  }
}

function share(storeName) {
  return (data) => {
    dock[storeName].shared = {
      ...dock[storeName].shared,
      ...data,
    }
  }
}

function runSubscriptions(subsObj) {
  const subsKeys = Object.keys(subsObj);
  subsKeys.forEach(key => subsObj[key]());
}

function createStore(storeName, reducer, initialState, cache) {
  const [state, dispatch] = useReducer(reducer, cache && dock[storeName]?.state || initialState);
  if (dock[storeName]) {
    dock[storeName].state = state;
  }
  if (!dock[storeName]) {
    dock[storeName] = {
      state,
      dispatch,
      share: share(storeName),
      subscribe: subscribe(storeName),
    }
  }
  useMemo(() => {
    subscriptions[storeName] = {};
  }, []);
  useEffect(() => {
    if (dock[storeName]) {
      runSubscriptions(subscriptions[storeName]);
    }
  });
  return dock[storeName];
}

function getStore(storeName) {
  return dock[storeName];
}

export function useNewHux(storeName, reducer, initialState) {
  if (!storeName || !reducer || !initialState) {
    throw new Error('You have to specify all 3 arguments: (storeName, reducer, initialState).');
  }
  dock[storeName] = createStore(storeName, reducer, initialState);
  return dock[storeName];
}

export function useHux(storeName) {
  if (!dock[storeName]) {
    throw new Error(`The store "${storeName}" doesn't exist. You have to create it with useNewHux(...) before trying to use.`);
  }
  return getStore(storeName);
}
