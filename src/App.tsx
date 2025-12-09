import "./App.css";
import { get, post } from "./services/http.ts";

function App() {
  const login = async () => {
    await post("http://localhost:8081/api/auth/login", {
      email: "abc@abc.com",
      password: "abc123",
    });
  };

  const test = async () => {
    await get("http://localhost:8081");
  };

  return (
    <div>
      <button onClick={login}>login</button>
      <button onClick={test}>test</button>
    </div>
  );
}
export default App;
