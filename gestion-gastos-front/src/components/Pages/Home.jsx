import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/fbAuthContext";
import { useEffect } from "react";
import styles from "./Home.module.css";

const Home = () => {
  const navigate = useNavigate();
  const { loggedIn } = useAuth();

  useEffect(() => {
    if (loggedIn) {
      navigate("/main");
    }
  }, [loggedIn, navigate]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>¡Bienvenido a Gestión de Gastos!</h1>
      <p className={styles.description}>
        En esta aplicación podrás gestionar tus gastos de forma sencilla
      </p>
    </div>
  );
};

export default Home;