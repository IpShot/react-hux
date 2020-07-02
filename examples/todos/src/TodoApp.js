import React from "react";
import { useNewStore } from './hux';
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import VisibilityFilters from "./components/VisibilityFilters";
import { TODO_STORE, VISIBILITY_FILTERS } from "./constants";
import "./styles.css";

const ADD_TODO = "ADD_TODO";
const TOGGLE_TODO = "TOGGLE_TODO";
const SET_FILTER = "SET_FILTER";

const initialState = {
  todos: {},
  filter: VISIBILITY_FILTERS.ALL
};

const reducer = function(state, action) {
  switch (action.type) {
    case ADD_TODO: {
      const { id, content } = action.payload;
      return {
        ...state,
        todos: {
          ...state.todos,
          [id]: {
            content,
            completed: false
          }
        }
      };
    }
    case TOGGLE_TODO: {
      const { id } = action.payload;
      return {
        ...state,
        todos: {
          ...state.todos,
          [id]: {
            ...state.todos[id],
            completed: !state.todos[id].completed
          }
        }
      };
    }
    case SET_FILTER: {
      return {
        ...state,
        filter: action.payload.filter
      };
    }
    default:
      return state;
  }
}

let nextTodoId = 0;

export default function TodoApp() {
  const { state, dispatch, share } = useNewStore(TODO_STORE, reducer, initialState);
  const actions = React.useMemo(() => ({
    addTodo(content) {
      dispatch({
        type: ADD_TODO,
        payload: {
          id: ++nextTodoId,
          content
        }
      })
    },
    toggleTodo(id) {
      dispatch({
        type: TOGGLE_TODO,
        payload: { id }
      })
    },
    setFilter(filter) {
      dispatch({
        type: SET_FILTER,
        payload: { filter }
      })
    },
  }), [dispatch]);

  share({ actions });

  return (
    <div className="todo-app">
      <h1>Todo List ({Object.keys(state.todos).length})</h1>
      <AddTodo />
      <TodoList />
      <VisibilityFilters />
    </div>
  );
}
