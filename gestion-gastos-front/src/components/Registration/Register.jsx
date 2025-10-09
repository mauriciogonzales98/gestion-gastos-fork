import { useAuth } from "../../Contexts/FBauthContext/index.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fbCreateUserWithEmailAndPassword } from "../../Firebase/auth.js";
import Form from "react-bootstrap/Form";
import { getAuth } from "firebase/auth";

const Register = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  
  const commitToDB = async (user, datosUsuario) => {
      try {
        const token = await user.getIdToken();

        datosUsuario.id = user.uid;
        await fetch('http://localhost:3001/api/user', {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authentication: `Bearer ${token}`,
          },
          body: JSON.stringify(datosUsuario),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.ok) {
              console.log("Usuario creado en BE");
              console.log(user.id);
            } else {
              console.log("Error al crear usuario en BE", res.message);
            }
          });
      } catch (error) {
        console.log(error);
      }
    };
  
  const submitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    const datosUsuario = {
      name: payload.name,
      surname: payload.surname,
      email: payload.email,
      password: payload.password,
      id: null
    };

    if (!isRegistering) {
      setIsRegistering(true);
      try {
        await fbCreateUserWithEmailAndPassword(payload.email, payload.password);
        const user = getAuth().currentUser;

        await commitToDB(user, datosUsuario);

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

        <form
          className="register-form"
          onSubmit={submitForm} /*onSubmit={(e) => onSubmit(e) }*/
        >
          <Form.Group>
            <label htmlFor="name">Name</label>
            <Form.Control
              type="text"
              id="name"
              name="name"
              //onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="surname">Surname</label>
            <Form.Control
              type="text"
              id="surname"
              name="surname"
              //onChange={(e) => setSurname(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group>
            <label htmlFor="email">Email</label>
            <Form.Control
              type="email"
              id="email"
              name="email"
              //onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group>
            <label htmlFor="password">Password</label>
            <Form.Control
              type="text"
              id="password"
              name="password"
              //onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Form.Control
              type="text"
              id="confirmPassword"
              name="confirmPassword"
              //onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>
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
