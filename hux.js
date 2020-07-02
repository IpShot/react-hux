import { useReducer, useRef, useMemo, useEffect } from 'react';
import shallowEqual from './shallowEqual';

let counter = 0;
const genId = () => counter++;
const dock = {};
const subscriptions = {};

function runSubscriptions(subsObj) {
  if (!subsObj) return;
  const subsKeys = Object.keys(subsObj);
  subsKeys.forEach(key => subsObj[key]());
}

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
    if (data.actions) {
      dock[storeName].actions = data.actions;
      delete data.actions;
    }
    dock[storeName].shared = {
      ...dock[storeName].shared,
      ...data,
    }
  }
}

function useCreateStore(storeName, reducer, initialState, options = { cache: true }) {
  const [state, dispatch] = useReducer(reducer, options.cache && dock[storeName]?.state || initialState);
  if (dock[storeName]) {
    dock[storeName].state = state;
    dock[storeName].dispatch = dispatch;
  }
  if (!dock[storeName]) {
    dock[storeName] = {
      state,
      dispatch,
      share: share(storeName),
      useSubscribe: subscribe(storeName),
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
  useEffect(() => {
    return () => delete dock[storeName].shared;
  }, []);
  return dock[storeName];
}

function getStore(storeName) {
  return dock[storeName];
}

export function useNewStore(storeName, reducer, initialState, options) {
  if (!storeName || !reducer || !initialState) {
    throw new Error('You have to specify all 3 arguments: (storeName, reducer, initialState).');
  }
  dock[storeName] = useCreateStore(storeName, reducer, initialState, options);
  return dock[storeName];
}

export function useStore(storeName) {
  if (!storeName) throw new Error(`You have to specify a store name argument.`);
  if (!dock[storeName]) {
    throw new Error(`The store "${storeName}" doesn't exist. You have to create it with useNewStore(...) before use.`);
  }
  return getStore(storeName);
}
