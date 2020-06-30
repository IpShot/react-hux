import { useReducer, useRef, useMemo, useEffect } from 'react';
import shallowEqual from './shallowEqual';

let counter = 0;
const genId = () => counter++;
const dock = {};
const subscriptions = {};

function getHux(storeName, reducer) {
  // ? mergeReducers(storeName, reducer);
  return dock[storeName].current;
}

function createSubscription(storeName, subId, data, update) {
  subscriptions[storeName][subId] = () => {
    console.log(`Run subscription ${subId}`);
    const prevState = dock[storeName].current.state;
    const keys = Object.keys(data);
    while (keys.length) {
      const key = keys.pop();
      if (prevState[key] !== data[key]) update();
    }
  }
}

function unsubscribe(storeName, id) {
  if (subscriptions[storeName]) {
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
    dock[storeName].current.shared = {
      ...data,
      ...dock[storeName].current.shared,
    }
  }
}

function run(subsObj) {
  const subsKeys = Object.keys(subsObj);
  while(subsKeys.length) {
    const key = subsKeys.shift();
    subsObj[key]();
  }
}

function createStore(storeName, reducer, initialState) {
  const [state, dispatch] = useReducer(reducer, initialState);
  if (dock[storeName]) {
    dock[storeName].current.state = state;
  }
  useMemo(() => {
    subscriptions[storeName] = {};
  }, []);
  useEffect(() => {
    if (dock[storeName]) {
      run(subscriptions[storeName]);
    }
  });
  dock[storeName] = useRef({
    state,
    dispatch,
    share: share(storeName),
    subscribe: subscribe(storeName),
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
