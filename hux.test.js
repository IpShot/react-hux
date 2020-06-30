import React, { useCallback, useReducer, useLayoutEffect } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import * as rtl from '@testing-library/react';
import { useNewStore, useStore } from './hux';
import shallowEqual from './shallowEqual';

let counter = 1;
const storeName = () => counter++;

describe('Hux', () => {
  let initialState;
  let reducer;

  beforeEach(() => {
    initialState = {
      value: 'Hello Hux!',
      loading: false,
    }
    reducer = (state, action) => {
      switch (action.type) {
        case 'UPDATE_VALUE':
          return {
            ...state,
            value: action.payload
          }
        case 'UPDATE_LOADING':
          return {
            ...state,
            loading: action.payload
          }
        default:
          return state
      }
    }
  })

  describe('useNewStore', () => {
    it('should return state equal to initial state', () => {
        const { result } = renderHook(
          () => useNewStore(storeName(), reducer, initialState)
        )
        expect(result.current.state).toEqual(initialState)
    })
    it('should update state on dispatch', () => {
        const { result } = renderHook(
          () => useNewStore(storeName(), reducer, initialState)
        )
        expect(result.current.state.value).toBe('Hello Hux!')
        act(() => {
          result.current.dispatch({
            type: 'UPDATE_VALUE',
            payload: 'Bye Hux!'
          })
        })
        expect(result.current.state.value).toBe('Bye Hux!')
    })
  })
  describe('useStore', () => {

  })
  describe('useSubscribe', () => {

  })
  describe('share', () => {

  })
})
