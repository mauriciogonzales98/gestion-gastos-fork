import { doEmailPasswordSignUp, doGoogleSignUp } from "../../Firebase/auth.js";
import { useAuth } from "../../Contexts/authContext/index.jsx";
import { useState, useEffect, Children } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "../../App.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (userLoggedIn) {
      navigate("/Main");
    }
  }, [navigate, userLoggedIn]);

  // Email and Password Sign In
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doEmailPasswordSignUp(email, password);
        navigate("/Main");
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
      doGoogleSignUp().catch((err) => {
        setErrorMessage(err.message);
        setIsSigningIn(false);
      });
    }
  };

  // Page
  return (
    <>
      <h1>Login Page</h1>

      {errorMessage && (
        <p
          className="error-message"
          style={{ color: "brown", backgroundColor: "lightyellow" }}
        >
          {errorMessage}
        </p>
      )}

      <form onSubmit={(e) => onSubmit(e)}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={onGoogleSignIn}>Sign in with Google</button>
      <label>¿No tiene una cuenta? </label>
      <a href="/register">Regístrese aquí</a>
    </>
  );
};

//Export
export default Login;
