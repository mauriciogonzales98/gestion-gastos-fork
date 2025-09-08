import "./App.css";
import Home from "./components/Home.jsx";
import Login from "./components/Registration/Login.jsx";
import Main from "./components/Main.jsx";
import NavBar from "./components/NavBar.jsx";
import { React, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Register from "./components/Registration/Register.jsx";
import { Navigate } from "react-router-dom";
import cors from "cors";

function App() {
  return (
    <>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/Main" element={<Main />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
App.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: true
  })
);
export default App;
