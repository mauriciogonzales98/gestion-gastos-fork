import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1>Bienvenido a GG</h1>
      <p>En esta aplicación podrás gestionar tus gastos de forma sencilla</p>
      <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
      <button onClick={() => navigate("/register")}>Registrarse</button>
    </>
  );
};
export default Home;
