import { useAuth } from "../../Contexts/authContext/index.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../../Firebase/auth.js";
import Form from "react-bootstrap/Form";
import { getAuth } from "firebase/auth";

const Register = () => {
  const navigate = useNavigate();
  // // States
  // const [name, setName] = useState("");
  // const [surname, setSurname] = useState("");
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  //current user

  //Recieves the data from the Form
  const submitForm = async (e) => {
    e.preventDefault();
    const commitToDB = async (e, user) => {
      fetch(`http://localhost:3001/api/user`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(datosUsuario),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            // exito
            alert("Usuario creado");
          }
        });
    };
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    let datosUsuario = {
      name: payload.name,
      surname: payload.surname,
      email: payload.email,
      password: payload.password,
    };

    if (!isRegistering) {
      setIsRegistering(true);
      // Firebase realiza únicamente la autenticación del usuario, por lo que solo vamos a
      // darle el email y la contraseña, y nos va a devolver el UID. El backend almacena también
      // name y surname como atributos separados, pero Firebase Auth no tiene la capacidad (ni la necesidad)
      // de guardar esos datos. Por eso, email y contraseña provienen de Firebase Auth (tienen que ser verificadas)
      // y el resto de datos directamente del Form.
      try {
        await doCreateUserWithEmailAndPassword(payload.email, payload.password);
        const user = getAuth.currentUser;

        await commitToDB(e, user);

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
