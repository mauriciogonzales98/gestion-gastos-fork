import "./App.css";
import Prueba from "./Prueba.jsx";
import Login from "./components/Registration/Login.jsx";
import React from "react";
function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div>
      {showLogin ? <Login /> : <Prueba onLoginClick={() => setShowLogin} />}
    </div>
  );
}

export default App;
