import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

interface Todo {
  id: string;
  content: string;
  owner: string | null;
  createdAt: string;
  updatedAt: string;
}

function App() {

  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => {
        // Type assertion to handle the nullable content
        const typedItems = items.map(item => ({
          ...item,
          content: item.content || ''
        })) as Todo[];
        setTodos(typedItems);
      }
    });

    return () => sub.unsubscribe();
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") ?? "" });
  }

  

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li
            onClick={() => deleteTodo(todo.id)}
            key={todo.id}
          >
            {todo.content}
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
