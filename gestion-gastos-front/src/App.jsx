import "./App.css";
import Home from "./Home.jsx";
import Login from "./components/Registration/Login.jsx";
import { React, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Registration/Register.jsx";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
