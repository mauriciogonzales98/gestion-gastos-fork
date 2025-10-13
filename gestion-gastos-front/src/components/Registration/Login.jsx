import { fbEmailPasswordSignUp, fbGoogleSignUp } from "../../Firebase/auth.js";
import { useAuth } from "../../Contexts/FBauthContext/index.jsx";
import React, { useState, useEffect, Children } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { PasswordInput } from "./PasswordInputs.jsx";
import styles from './Login.module.css'



const Login = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (userLoggedIn) {
      navigate("/main");
    }
  }, [navigate, userLoggedIn]);

  // Email and Password Sign In
  const submitForm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        //Firebase Auth Sign in
        await fbEmailPasswordSignUp(payload.email, payload.password);
      } catch (err) {
        if (err.message === "Firebase: Error (auth/invalid-credential).") {
          setErrorMessage("Invalid email or password");
        } else {
          setErrorMessage(err.message);
        }
        setIsSigningIn(false);
      }
    }
  };

  // Google Sign In
  const onGoogleSignIn = async (e) => {
    e.preventDefault();

    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await fbGoogleSignUp();
      } catch (err) {
        setErrorMessage(err.message);
      }
      setIsSigningIn(false);
      // navigate("/Main");
    }
  };

  // Page
  return (
    <>
      <div className={styles.container}>
      </div>
      {errorMessage && (
        <p
          className="error-message"
          style={{ color: "brown", backgroundColor: "lightyellow" }}
        >
          {errorMessage}
        </p>
      )}
      <form onSubmit={submitForm} className={styles.form}>
        <h1 className={styles.title}>Inicia Sesión</h1>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <Form.Control 
          type="text" 
          id="email" 
          name="email" 
          className={styles.input} 
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Password:</label>
          <Form.Control
            as={PasswordInput}
            type="password"
            id="password"
            name="password"
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.submitButton}>Iniciar Sesión</button>
        <div className={styles.divider}>O</div>
        <button
        className={styles.googleButton}
        onClick={onGoogleSignIn}
        >
        Continuar con Google
      </button>
      <div>
        ¿No tiene una cuenta? <a href="/register">Regístrese aquí</a>
      </div>
      </form>
    </>
  );
};

export default Login;
