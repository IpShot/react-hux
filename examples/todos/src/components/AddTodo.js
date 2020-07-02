import React, { useState } from "react";
import { useStore } from "../hux";
import { TODO_STORE } from "../constants";

const AddTodo = () => {
  const { shared } = useStore(TODO_STORE);
  const [input, setInput] = useState('');

  function handleAddTodo() {
    shared.actions.addTodo(input);
    setInput('');
  }
  return (
    <div>
      <input onChange={e => setInput(e.target.value)} />
      <button className="add-todo" onClick={handleAddTodo}>
        Add Todo
      </button>
    </div>
  );
};

export default AddTodo;
