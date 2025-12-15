import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/auth/Login.tsx";
import Register from "./pages/auth/Register.tsx";
import { useEffect } from "react";
import { setupInterceptor } from "./services/http.ts";
import { useAuth } from "./context/AuthContext.tsx";
import Home from "./pages/home/Home.tsx";
import DevicePage from "./pages/device/DevicePage.tsx";

function App() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  useEffect(() => {
    setupInterceptor(() => {
      logout();
    });
  }, [navigate, logout]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path={"/"} element={<Home />} />
        <Route path={"/devices/:id"} element={<DevicePage />} />
      </Routes>
    </>
  );
}

export default App;
