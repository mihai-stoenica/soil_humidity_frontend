import "./App.css";
import { get, post } from "./services/http.ts";

function App() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  console.log(apiUrl);
  const login = async () => {
    await post(`${apiUrl}/auth/login`, {
      email: "abc@abc.com",
      password: "abc123",
    });
  };

  const test = async () => {
    await get(`${apiUrl}/plants/`);
  };

  return (
    <div>
      <button onClick={login}>login</button>
      <button onClick={test}>test</button>
    </div>
  );
}
export default App;
