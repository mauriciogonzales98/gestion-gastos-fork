import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fbCreateUserWithEmailAndPassword,
  fbEmailPasswordSignIn,
  fbGoogleSignIn,
} from "../../../../Firebase/auth.js";
import { getAuth } from "firebase/auth";
import StatusService from "../../../../Services/status/serviceStatus.js";
import styles from "./Register.module.css";

const Register = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reglas de validación de contraseña
  const passwordRules = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRules).every(rule => rule);
  const passwordsMatch = password === confirmPassword;

  const registrationProcess = async (userData) => {
    const statusService = new StatusService();
    const isServiceDown = await statusService.checkBackendStatus();
    if (!isServiceDown) {
      console.log("El Backend está caído.");
      navigate("/serverdown");
      throw new Error("BACKEND_DOWN");
    }
    try {
      const response = await fetch(`http://localhost:3001/api/registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Registration failed"
        );
      }

      const result = await response.json();
      if (result.data && result.data.userId) {
        console.log("User created successfully in backend");
        return result;
      } else {
        throw new Error(result.error || "Registration incomplete");
      }
    } catch (error) {
      console.error("Registration process error:", error);
      throw error;
    }
  };

  // Register with email and password
  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isRegistering) return;
    setIsRegistering(true);

    try {
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData);

      // Validate passwords match
      if (!passwordsMatch) {
        throw new Error("Las contraseñas no coinciden");
      }

      // Validate password strength
      if (!isPasswordValid) {
        throw new Error("La contraseña no cumple con todos los requisitos");
      }

      // Prepare registration data
      const userData = {
        name: payload.name,
        surname: payload.surname,
        email: payload.email,
        password: payload.password,
        isGoogleSignUp: false,
      };

      console.log("Starting registration process...");

      // Step 1: Register in backend (this will create Firebase user via Admin SDK)
      const registrationResult = await registrationProcess(userData);

      // Step 2: If backend registration successful, log user in with frontend SDK
      if (registrationResult.data.userId) {
        try {
          await fbEmailPasswordSignIn(payload.email, payload.password);
          console.log("User logged in successfully");
          navigate("/Main");
        } catch (loginError) {
          console.warn(
            "Auto-login failed, but registration was successful:",
            loginError
          );
          // Registration was successful, user can log in manually
          navigate("/login", {
            state: {
              message: "Registration successful! Please log in.",
            },
          });
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage(err.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  // Google registration
  const onGoogleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isRegistering) return;
    setIsRegistering(true);

    try {
      // Google sign up creates the Firebase user immediately
      await fbGoogleSignIn();
      const user = getAuth().currentUser;


      if (user) {
        const userData = {
          id: user.uid,
          name: user.displayName ? user.displayName.split(" ")[0] : "",
          surname: user.displayName ? user.displayName.split(" ").slice(1).join(" ") : "",
          email: user.email,
        };

        await registerWithGoogle(user, userData);
        navigate("/Main");
      }
    } catch (err) {
      console.error("Google registration error:", err);
      setErrorMessage(err.message || "Google registration failed");
      setIsRegistering(false);
    }
  };

  const registerWithGoogle = async (user, userData) => {
    try {
      await fetch(`http://localhost:3001/api/user`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(userData),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res && res.success != false) {
            console.log("Usuario creado en BE");
          } else {
            console.log(
              "Error al crear usuario en BE",
              res?.message || "Unknown error"
            );
          }
        });
    } catch (error) {
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Crear Cuenta</h2>
        {errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}

        <form className={styles.form} onSubmit={submitForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              required
              disabled={isRegistering}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="surname" className={styles.label}>Apellido</label>
            <input
              type="text"
              id="surname"
              name="surname"
              className={styles.input}
              required
              disabled={isRegistering}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              required
              disabled={isRegistering}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              required
              disabled={isRegistering}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {/* Lista de reglas de contraseña */}
            {password && (
              <div className={styles.passwordRules}>
                <h4 className={styles.rulesTitle}>La contraseña debe contener:</h4>
                <ul className={styles.rulesList}>
                  <li className={passwordRules.minLength ? styles.ruleValid : styles.ruleInvalid}>
                    {passwordRules.minLength ? "✅" : "❌"} Mínimo 8 caracteres
                  </li>
                  <li className={passwordRules.hasUpperCase ? styles.ruleValid : styles.ruleInvalid}>
                    {passwordRules.hasUpperCase ? "✅" : "❌"} Una letra mayúscula
                  </li>
                  <li className={passwordRules.hasLowerCase ? styles.ruleValid : styles.ruleInvalid}>
                    {passwordRules.hasLowerCase ? "✅" : "❌"} Una letra minúscula
                  </li>
                  <li className={passwordRules.hasNumber ? styles.ruleValid : styles.ruleInvalid}>
                    {passwordRules.hasNumber ? "✅" : "❌"} Un número
                  </li>
                  <li className={passwordRules.hasSpecialChar ? styles.ruleValid : styles.ruleInvalid}>
                    {passwordRules.hasSpecialChar ? "✅" : "❌"} Un carácter especial (!@#$%^&* etc.)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={styles.input}
              required
              disabled={isRegistering}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
            {/* Indicador de coincidencia de contraseñas */}
            {confirmPassword && (
              <div className={passwordsMatch ? styles.matchValid : styles.matchInvalid}>
                {passwordsMatch ? "✅" : "❌"} Las contraseñas {passwordsMatch ? "coinciden" : "no coinciden"}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isRegistering || !isPasswordValid || !passwordsMatch}
          >
            {isRegistering ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>o</span>
          <div className={styles.dividerLine}></div>
        </div>

        <button 
          onClick={onGoogleRegister}
          className={styles.googleButton}
          disabled={isRegistering}
        >
          {isRegistering ? "Procesando..." : "Registrarse con Google"}
        </button>

        <div className={styles.linkContainer}>
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className={styles.link}>Iniciar sesión</a>
        </div>
      </div>
    </div>
  );
};

export default Register;