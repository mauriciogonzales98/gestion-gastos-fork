import "./App.css";
import Main from "./components/Pages/Main.jsx";
import NavBar from "./components/Pages/NavBar.jsx";
import PageNotFound from "./components/Pages/Service/PageNotFound.jsx";
import HomeWithLogin from "./components/Pages/HomeWithLogin.jsx";
import Profile from "./components/Pages/Profile.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/User/userCreate/Register/Register.jsx";
import { useAuth } from "./Contexts/fbAuthContext/index.jsx";
import CategoryForm from "./components/Category/CategoryForm/CategoryForm.jsx";
import ServerDown from "./components/Pages/Service/ServerDown.jsx";

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
            <Route path="/categories" element={<CategoryForm />} />
            <Route path="/serverdown" element={<ServerDown />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
