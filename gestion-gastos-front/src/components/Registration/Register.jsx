import { useAuth } from "../../Contexts/FBauthContext/index.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fbCreateUserWithEmailAndPassword,
  fbGoogleSignUp,
} from "../../Firebase/auth.js";
import Form from "react-bootstrap/Form";
import { getAuth, getRedirectResult } from "firebase/auth";

// Esta función envía los datos del usuario al BE, se utiliza tanto al registrarse
// con email y contraseña como con Google.
const Register = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  console.log("Estado de isRegistering: ", isRegistering);

  // Envía la información al BE
  const commitToDB = async (e, user, datosUsuario) => {
    console.log("Commiting to DB from Google");
    try {
      await fetch(`http://localhost:3001/api/user`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(datosUsuario),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res && res.success != false) {
            console.log("Usuario creado en BE");
            // BORRAR FUERA TESTING
            console.log("uid de FB: ", user.uid);
          } else {
            console.log(
              "Error al crear usuario en BE",
              res?.message || "Unknown error"
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  //Register con google, podría ser lo mismo que el login, tal vez
  const onGoogleRegister = async (e) => {
    e.preventDefault();

    console.log("Estado de isRegistering: ", isRegistering);
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        await fbGoogleSignUp();
        const user = getAuth().currentUser;
        // After returning from the redirect when your app initializes you can obtain the result
        console.log("Resultado de getAuth().currentUser: ", user);
        if (user) {
          // This is the registered user
          // Esto asume usuarios con un solo nombre y un solo apellido para el parseo.
          const datosUsuario = {
            id: user.uid,
            name: user.displayName ? user.displayName.split(" ")[0] : "",
            surname: user.displayName ? user.displayName.split(" ")[1] : "",
            email: user.email,
            password: null,
          };
          await commitToDB(e, user, datosUsuario);
        }
        navigate("/Main");
      } catch (err) {
        setErrorMessage(err.message);
        setIsRegistering(false);
      }
    }
  };

  // Commit to DB when registering from google

  //Registrarse con email y contraseña
  const submitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        await fbCreateUserWithEmailAndPassword(
          //estos dos datos solían ser payload.email y payload.password, los cambié por las dudas, pero podrían romper algo.
          payload.email,
          payload.password
        );
        const user = getAuth().currentUser;
        const datosUsuario = {
          id: user.uid,
          name: payload.name,
          surname: payload.surname,
          email: payload.email,
          password: payload.password,
        };

        //await commitToDBFromEmailAndPassword(e, user, datosUsuario);
        await commitToDB(e, user, datosUsuario);
        navigate("/Main");
      } catch (err) {
        setErrorMessage(err.message);
        setIsRegistering(false);
      }
    }
  };
  // Commit to DB when registering from email and password
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
          ¿Le diste al link sin querer? Inicia sesión acá.{" "}
          <a href="/login">Iniciar sesión</a>
        </p>
        <p>
          ¿Preferís venderle tus datos a google?
          <button onClick={onGoogleRegister}>Registrarse con Google</button>
        </p>
      </div>
    </>
  );
};

export default Register;
