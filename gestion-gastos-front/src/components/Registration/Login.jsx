import { fbEmailPasswordSignUp, fbGoogleSignUp } from "../../Firebase/auth.js";
import { useAuth } from "../../Contexts/FBauthContext/index.jsx";
import { useState, useEffect, Children } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "../../App.jsx";
import Form from "react-bootstrap/form";

const Login = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (userLoggedIn) {
      navigate("/Main");
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
  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!isSigningIn) {
  //     setIsSigningIn(true);
  //     try {
  //       await doEmailPasswordSignUp(email, password);
  //       navigate("/Main");
  //     } catch (err) {
  //       if (err.message === "Firebase: Error (auth/invalid-credential).") {
  //         setErrorMessage("Invalid email or password");
  //       } else {
  //         setErrorMessage(err.message);
  //       }
  //       setIsSigningIn(false);
  //     }
  //   }
  // };
  // Google Sign In
  const onGoogleSignIn = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      fbGoogleSignUp().catch((err) => {
        setErrorMessage(err.message);
        setIsSigningIn(false);
      });
      navigate("/home");
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

      <form onSubmit={submitForm}>
        <label>Email:</label>
        <Form.Control
          type="text"
          id="email"
          name="email"
          //onChange={(e) => setName(e.target.value)}
          required
        />
        <label>Password:</label>
        <Form.Control
          type="password"
          id="password"
          name="password"
          //onChange={(e) => setName(e.target.value)}
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
