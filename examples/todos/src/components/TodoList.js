import React from "react";
import { useStore} from "../hux";
import Todo from "./Todo";
import { TODO_STORE, VISIBILITY_FILTERS } from "../constants";

function getFilteredTodos(todos, filter) {
  const todosArr = Object.keys(todos).map(id => ({ ...todos[id], id }));
  if (filter === VISIBILITY_FILTERS.ALL) return todosArr;
  if (filter === VISIBILITY_FILTERS.COMPLETED) {
    return todosArr.filter(todo => todo.completed);
  } else {
    return todosArr.filter(todo => !todo.completed);
  }
}

const TodoList = React.memo(() => {
  const { state, actions, useSubscribe } = useStore(TODO_STORE)
  const { todos, filter } = state;
  const filteredTodos = getFilteredTodos(todos, filter);

  useSubscribe({ todos, filter });

  return (
    <ul className="todo-list">
      {filteredTodos && filteredTodos.length
        ? filteredTodos.map((todo, index) =>
            <Todo
              key={`todo-${todo.id}`}
              todo={todo}
              toggleTodo={actions.toggleTodo}
            />
          )
        : "No todos, yay!"}
    </ul>
  );
});

export default TodoList;
