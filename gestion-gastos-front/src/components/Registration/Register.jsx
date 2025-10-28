import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fbCreateUserWithEmailAndPassword,
  fbEmailPasswordSignIn,
  fbGoogleSignIn,
} from "../../Firebase/auth.js";
import Form from "react-bootstrap/Form";
import { getAuth } from "firebase/auth";

const Register = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const registrationProcess = async (userData) => {
    console.log("Starting registration process with data:", userData);
    try {
      const serverStatus = await fetch("http://localhost:3001/api/status", {
        method: "GET",
      });
      console.log(serverStatus);
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
      console.log("Registration result:", result);
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
      if (payload.password !== payload.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Prepare registration data
      const userData = {
        name: payload.name,
        surname: payload.surname,
        email: payload.email,
        password: payload.password,
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
      const result = await fbGoogleSignIn();
      const user = result.user;

      console.log("Google registration successful:", user);

      if (user) {
        const userData = {
          name: user.displayName ? user.displayName.split(" ")[0] : "",
          surname: user.displayName
            ? user.displayName.split(" ").slice(1).join(" ")
            : "",
          email: user.email,
        };

        // Register in backend
        await registrationProcess(userData);

        navigate("/Main");
      }
    } catch (err) {
      console.error("Google registration error:", err);
      setErrorMessage(err.message || "Google registration failed");
      setIsRegistering(false);
    }
  };

  return (
    <>
      <div className="register-container">
        <h2>Register</h2>
        {errorMessage && (
          <p
            className="error-message"
            style={{ color: "brown", backgroundColor: "lightyellow" }}
          >
            {errorMessage}
          </p>
        )}

        <form className="register-form" onSubmit={submitForm}>
          <Form.Group>
            <label htmlFor="name">Name</label>
            <Form.Control
              type="text"
              id="name"
              name="name"
              required
              disabled={isRegistering}
            />
            <label htmlFor="surname">Surname</label>
            <Form.Control
              type="text"
              id="surname"
              name="surname"
              required
              disabled={isRegistering}
            />
          </Form.Group>
          <Form.Group>
            <label htmlFor="email">Email</label>
            <Form.Control
              type="email"
              id="email"
              name="email"
              required
              disabled={isRegistering}
            />
          </Form.Group>
          <Form.Group>
            <label htmlFor="password">Password</label>
            <Form.Control
              type="password"
              id="password"
              name="password"
              required
              disabled={isRegistering}
              minLength={8}
            />
          </Form.Group>
          <Form.Group>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Form.Control
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              disabled={isRegistering}
              minLength={8}
            />
          </Form.Group>
          <button type="submit" disabled={isRegistering}>
            {isRegistering ? "Registering..." : "Register"}
          </button>
        </form>

        <p>
          ¿Le diste al link sin querer? Inicia sesión acá.{" "}
          <a href="/login">Iniciar sesión</a>
        </p>

        <p>
          ¿Preferís venderle tus datos a google?
          <button onClick={onGoogleRegister} disabled={isRegistering}>
            {isRegistering ? "Registering..." : "Registrarse con Google"}
          </button>
        </p>
      </div>
    </>
  );
};

export default Register;
