import { fbEmailPasswordSignIn, fbGoogleSignIn } from "../../Firebase/auth.js";
import { useAuth } from "../../Contexts/fbAuthContext/index.jsx";
import React, { useState, useEffect, Children } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Form from "react-bootstrap/Form";
import { PasswordInput } from "./PasswordInputs.jsx";
import styles from "./Login.module.css";
import logo from "./ggs2.png";
import StatusService from "../../Services/status/serviceStatus.js";

const Login = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [friendlyErrorMessage, setFriendlyErrorMessage] = useState("");

  useEffect(() => {
    if (userLoggedIn) {
      navigate("/main");
    }
  }, [navigate, userLoggedIn]);

  // Email and Password Sign In
  const submitLoginForm = async (e) => {
    e.preventDefault();
    const statusService = new StatusService();
    const isServiceDown = await statusService.checkBackendStatus();
    if (!isServiceDown) {
      console.log("El Backend está caído.");
      navigate("/serverdown");
      return;
    }

    // Mensaje de error si ya está logueado
    if (getAuth().currentUser) setErrorMessage("Ya está logueado");

    //Obtiene datos del formulario y los transforma en un objeto
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        //Firebase Auth Sign in
        await fbEmailPasswordSignIn(payload.email, payload.password);
      } catch (err) {
        setFriendlyErrorMessage(
          "Ocurrió un error inesperado. Por favor, intenta nuevamente."
        );

        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            setFriendlyErrorMessage(
              "Email o contraseña incorrectos. Por favor, verifica tus credenciales."
            );

            break;

          case "auth/invalid-email":
            setFriendlyErrorMessage(
              "El formato del email es inválido. Por favor, ingresa un email válido."
            );
            break;

          case "auth/user-disabled":
            setFriendlyErrorMessage(
              "Esta cuenta ha sido deshabilitada. Por favor, contacta al soporte."
            );
            break;

          case "auth/too-many-requests":
            setFriendlyErrorMessage(
              "Demasiados intentos fallidos. Por favor, espera unos minutos antes de intentar nuevamente."
            );
            break;

          case "auth/network-request-failed":
            setFriendlyErrorMessage(
              "Error de conexión. Por favor, verifica tu conexión a internet."
            );
            break;

          case "auth/operation-not-allowed":
            setFriendlyErrorMessage(
              "El inicio de sesión con email y contraseña no está habilitado."
            );
            break;

          default:
            // Para errores no manejados específicamente, usar un mensaje genérico
            console.error(
              "Error de Firebase no manejado:",
              err.code,
              err.message
            );
            setFriendlyErrorMessage(
              "Error al iniciar sesión. Por favor, intenta nuevamente."
            );
        }
        setIsSigningIn(false);
        return;
      }
      navigate("/Main");
    }
  };

  // Google Sign In
  const onGoogleSignIn = async (e) => {
    e.preventDefault();

    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await fbGoogleSignIn();
      } catch (err) {
        setErrorMessage(err.message);
      }
      setIsSigningIn(false);
      navigate("/Main");
    }
  };

  // Page
  return (
    <>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src={logo} />
        </div>
      </div>
      {friendlyErrorMessage && (
        <>
          <h1>Login Page</h1>
        </>
      )}

      {friendlyErrorMessage && (
        <p
          className="error-message"
          style={{ color: "brown", backgroundColor: "lightyellow" }}
        >
          {friendlyErrorMessage}
        </p>
      )}
      <form onSubmit={submitLoginForm} className={styles.form}>
        <h1 className={styles.title}>Inicia Sesión</h1>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <Form.Control
            type="text"
            id="email"
            name="email"
            placeholder="Ingrese su correo electrónico"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Contraseña:</label>
          <Form.Control
            as={PasswordInput}
            type="password"
            id="password"
            name="password"
            placeholder="Ingrese su contraseña"
            className={styles.input}
          />
        </div>
        s
        <button type="submit" className={styles.submitButton}>
          Iniciar Sesión
        </button>
        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>O</span>
          <div className={styles.dividerLine}></div>
        </div>
        <button
          className={styles.googleButton}
          onClick={onGoogleSignIn}
          type="button"
        >
          Continuar con Google
        </button>
        <div className={styles.linkContainer}>
          ¿No tiene una cuenta?
          <a href="/register" className={styles.link}>
            Regístrese aquí
          </a>
        </div>
      </form>
    </>
  );
};

export default Login;