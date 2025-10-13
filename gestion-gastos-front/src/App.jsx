import "./App.css";
import Home from "./components/Home.jsx";
import Login from "./components/Registration/Login.jsx";
import Main from "./components/Main.jsx";
import NavBar from "./components/NavBar.jsx";
import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Register from "./components/Registration/Register.jsx";
import { useAuth } from "./Contexts/FBauthContext";

function HomeWithLogin() {
  return (
    <div className="split-layout">
      <div className="left-panel">
        <Login />
      </div>
      <div className="right-panel">
        <Home />
      </div>
    </div>
  );
}

function App() {
  const { loggedIn } = useAuth();

return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {loggedIn && <NavBar />}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomeWithLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/main" element={<Main />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;