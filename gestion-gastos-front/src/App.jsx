import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./Contexts/fbAuthContext/index.jsx";

import NavBar from "./components/Pages/NavBar.jsx";

import HomeWithLogin from "./components/Pages/HomeWithLogin.jsx";

import Register from "./components/User/userCreate/Register/Register.jsx";

import Main from "./components/Pages/Main.jsx";
import CategoryForm from "./components/Category/CategoryForm/CategoryForm.jsx";
import CreateWallet from "./components/Wallet/createWallet/CreateWallet.jsx";

import Profile from "./components/Pages/Profile.jsx";

import ServerDown from "./components/Pages/ServicePages/ServerDown.jsx";
import PageNotFound from "./components/Pages/ServicePages/PageNotFound.jsx";

import MercadoPagoTest from "./components/PruebaMP/PruebaMP.jsx";

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
            <Route path="/create-wallet" element={<CreateWallet />} />

            <Route path="/profile" element={<Profile />} />

            <Route path="/serverdown" element={<ServerDown />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="mptest" element={<MercadoPagoTest />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
