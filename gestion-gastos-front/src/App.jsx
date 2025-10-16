import "./App.css";
import Home from "./components/Home.jsx";
import Login from "./components/Registration/Login.jsx";
import Main from "./components/Main.jsx";
import NavBar from "./components/NavBar.jsx";
import PageNotFound from "./components/PageNotFound.jsx";
import HomeWithLogin from "./components/HomeWithLogin.jsx";
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Switch,
  useNavigate,
} from "react-router-dom";
import Register from "./components/Registration/Register.jsx";
import { useAuth } from "./Contexts/FBauthContext";

function App() {
  const { loggedIn } = useAuth();

return (
    <BrowserRouter>
      <div className="app-container">
        {loggedIn && <NavBar />}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomeWithLogin />} />
            <Route path="/login" element={<HomeWithLogin />} />
            <Route path="/home" element={<HomeWithLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/main" element={<Main />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;