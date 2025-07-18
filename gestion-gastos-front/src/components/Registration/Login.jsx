import { doEmailPasswordSignUp, doGoogleSignUp } from "../../Firebase/auth.js";
import { useAuth } from "../../Contexts/authContext/index.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "../../App.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Email and Password Sign In
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      await doEmailPasswordSignUp(email, password);
    }
  };
  // Google Sign In
  const onGoogleSignIn = async () => {
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
      {/* {userLoggedIn && <Navigate to={"/home"} replace={true} />} */}
      <h1>Login Page</h1>
      <button onClick={() => navigate("/")}>HOME</button>

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
    </>
  );
};

//Export
export default Login;
