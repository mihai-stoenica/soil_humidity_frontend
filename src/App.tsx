import "./App.css";
import { useEffect, useState } from "react";
import { get } from "./services/http.ts";

type TodoBody = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

function App() {
  const [todos, setTodos] = useState<TodoBody[]>([]);

  useEffect(() => {
    const fetchTodo = async () => {
      const response = await get("https://jsonplaceholder.typicode.com/todos");
      if (!response.isError) {
        setTodos(response.data);
      }
    };
    fetchTodo();
  }, []);

  return (
    <div>
      {todos ? (
        todos.map((todo: TodoBody) => (
          <div>
            <p>ID: {todo.id}</p>
            <p>Title: {todo.title}</p>
            <p>Completed: {todo.completed ? "Yes" : "No"}</p>
            <hr />
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
export default App;
