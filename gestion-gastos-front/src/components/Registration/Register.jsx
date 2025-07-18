import { useAuth } from "../../Contexts/authContext/index.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../../Firebase/auth.js";
const Register = () => {
  const navigate = useNavigate();
  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Email and Password Registration
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      if (password === confirmPassword && password.length >= 6) {
        await doCreateUserWithEmailAndPassword(email, password);
      } else if (password !== confirmPassword || password.length < 6) {
        setErrorMessage("Las contraseñas no coinciden o son demasiado cortas");
        setIsRegistering(false);
      }
    }
  };

  return (
    <>
      <div className="register-container">
        <h2>Register</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button onClick={() => navigate("/")}>HOME</button>
        <form className="register-form" onSubmit={(e) => onSubmit(e)}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
        <p>
          ¿Ya tenés una cuenta? Inicia sesión aquí.{" "}
          <a href="/login">Iniciar sesión</a>
        </p>
      </div>
    </>
  );
};

export default Register;
