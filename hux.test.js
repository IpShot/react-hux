import { memo, useCallback, useReducer, useLayoutEffect } from 'react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import * as rtl from '@testing-library/react';
import { useNewStore, useStore } from './hux';
import shallowEqual from './shallowEqual';

let counter = 1
const genStoreName = () => counter++

describe('Hux', () => {
  let initialState
  let reducer
  let STORE_NAME
  let renders

  beforeEach(() => {
    STORE_NAME = genStoreName()
    renders = []
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

  afterEach(() => {
    rtl.cleanup()
    cleanup()
  })

  describe('useNewStore', () => {
    it('should return state equal to initial state on initial render', () => {
      const { result } = renderHook(
        () => useNewStore(STORE_NAME, reducer, initialState)
      )
      expect(result.current.state).toEqual(initialState)
    })
    it('should return updated state on dispatch', () => {
      const { result } = renderHook(
        () => useNewStore(STORE_NAME, reducer, initialState)
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
    it('should return the latest state on multiple dispatches', () => {
      const { result } = renderHook(
        () => useNewStore(STORE_NAME, reducer, initialState)
      )
      expect(result.current.state.value).toBe('Hello Hux!')
      act(() => {
        result.current.dispatch({
          type: 'UPDATE_VALUE',
          payload: 'Bye Hux!'
        })
        result.current.dispatch({
          type: 'UPDATE_VALUE',
          payload: 'Last Hux!'
        })
      })
      expect(result.current.state.value).toBe('Last Hux!')
    })
    it('should return the latest state on every async dispatch', async () => {
      const { result } = renderHook(
        () => useNewStore(STORE_NAME, reducer, initialState)
      )
      expect(result.current.state.value).toBe('Hello Hux!')
      await new Promise((resolve) => {
        act(() => {
          result.current.dispatch({
            type: 'UPDATE_VALUE',
            payload: 'Bye Hux!'
          })
        })
        resolve()
      })
      expect(result.current.state.value).toBe('Bye Hux!')
      await new Promise((resolve) => {
        act(() => {
          result.current.dispatch({
            type: 'UPDATE_VALUE',
            payload: 'Last Hux!'
          })
        })
        resolve()
      })
      expect(result.current.state.value).toBe('Last Hux!')
    })
    it('should call render on dispatch regardless useSubscribe', () => {
      let store
      const Comp = () => {
        store = useNewStore(STORE_NAME, reducer, initialState)
        const { value, loading } = store.state
        store.useSubscribe({ loading })
        renders.push(value)
        return <span />
      }

      rtl.render(<Comp />)
      expect(renders).toEqual(['Hello Hux!'])
      rtl.act(() => {
        store.dispatch({
          type: 'UPDATE_VALUE',
          payload: 'Bye Hux!'
        })
      })
      expect(renders).toEqual(['Hello Hux!', 'Bye Hux!'])
    })
    it('should return cached state if component unmounted and mounted again', () => {
      let store
      let oldState
      const Comp = () => {
        store = useNewStore(STORE_NAME, reducer, initialState)
        return <span />
      }
      const { unmount } = rtl.render(<Comp />)
      expect(store.state.value).toBe('Hello Hux!')
      rtl.act(() => {
        store.dispatch({
          type: 'UPDATE_VALUE',
          payload: 'Bye Hux!'
        })
      })
      expect(store.state.value).toBe('Bye Hux!')
      oldState = store.state
      unmount()
      rtl.render(<Comp />)
      expect(store.state).toEqual(oldState)
      expect(store.state.value).toBe('Bye Hux!')
    })
    it('should return initial state if component unmounted and mounted again and cache option set to false', () => {
      let store
      let oldState
      const Comp = () => {
        store = useNewStore(STORE_NAME, reducer, initialState, { cache: false })
        return <span />
      }
      const { unmount } = rtl.render(<Comp />)
      expect(store.state.value).toBe('Hello Hux!')
      rtl.act(() => {
        store.dispatch({
          type: 'UPDATE_VALUE',
          payload: 'Bye Hux!'
        })
      })
      expect(store.state.value).toBe('Bye Hux!')
      oldState = store.state
      unmount()
      rtl.render(<Comp />)
      expect(store.state).not.toEqual(oldState)
      expect(store.state.value).toBe('Hello Hux!')
    })
    it('should throw an error on any of arguments miss except options', () => {
      const { result } = renderHook(
        () => useNewStore(STORE_NAME, reducer, initialState)
      )
      const { result:result0 } = renderHook(
        () => useNewStore()
      )
      const { result:result1 } = renderHook(
        () => useNewStore(STORE_NAME)
      )
      const { result:result2 } = renderHook(
        () => useNewStore(STORE_NAME, reducer)
      )
      const { result:result1_0 } = renderHook(
        () => useNewStore(null, reducer, initialState)
      )
      const { result:result2_0 } = renderHook(
        () => useNewStore(STORE_NAME, null, initialState)
      )
      const { result:result3_0 } = renderHook(
        () => useNewStore(STORE_NAME, reducer, null, {})
      )
      expect(result.error).toBe(undefined)
      expect(result0.error).not.toBe(undefined)
      expect(result1.error).not.toBe(undefined)
      expect(result2.error).not.toBe(undefined)
      expect(result1_0.error).not.toBe(undefined)
      expect(result2_0.error).not.toBe(undefined)
      expect(result3_0.error).not.toBe(undefined)
    })
  })
  describe('useStore', () => {
    it('should return state equal to state returned by useNewStore in parent', () => {
      const { result } = renderHook(
        () => useNewStore(STORE_NAME, reducer, initialState)
      )
      expect(result.current.state).toEqual(initialState)
    })
  })
  describe('useSubscribe', () => {

  })
  describe('share', () => {

  })
})
