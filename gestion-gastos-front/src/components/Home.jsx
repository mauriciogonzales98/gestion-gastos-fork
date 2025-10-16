import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/FBauthContext";
import { useEffect } from "react";
const Home = () => {

  const navigate = useNavigate();
  const { loggedIn } = useAuth();

  useEffect(() => {
      if (loggedIn) {
        navigate("/main");
      }
  }, [loggedIn, navigate]);

  return (
    <>
      <h1>Bienvenido a GG</h1>
      <p>En esta aplicación podrás gestionar tus gastos de forma sencilla</p>

      {!loggedIn && (
        <>
          <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
          <button onClick={() => navigate("/register")}>Registrarse</button>
        </>
      )}
    </>
  );
};
export default Home;
