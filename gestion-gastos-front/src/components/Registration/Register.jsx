import { useAuth } from "../../Contexts/authContext/index.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../../Firebase/auth.js";
import { updateProfile } from "firebase/auth";
const Register = () => {
  const navigate = useNavigate();
  // States
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Colocar en validPassword todas las validaciones de contraseña respecto de longitud y complejidad
  // Las funciones de Firebase no se encargan de validaciones de ese tipo.

  // Email and Password Registration
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);

      try {
        const userCredential = await doCreateUserWithEmailAndPassword(
          email,
          password
        );
        updateProfile(userCredential.user, {
          displayName: `${name} ${surname}`,
        });
        navigate("/Main");
      } catch (err) {
        setErrorMessage(err.message);
        setIsRegistering(false);
      }
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

        <form className="register-form" onSubmit={(e) => onSubmit(e)}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="surname">Surname</label>
            <input
              type="text"
              id="surname"
              name="surname"
              onChange={(e) => setSurname(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="text"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="text"
              id="confirmPassword"
              name="confirmPassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
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
