import React, { useState } from "react";
import { useStore } from "../hux";
import { TODO_STORE } from "../constants";

const AddTodo = () => {
  const { actions } = useStore(TODO_STORE);
  const [input, setInput] = useState('');

  function handleAddTodo() {
    if (input) {
      actions.addTodo(input);
      setInput('');
    }
  }
  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button className="add-todo" onClick={handleAddTodo}>
        Add Todo
      </button>
    </div>
  );
};

export default AddTodo;
