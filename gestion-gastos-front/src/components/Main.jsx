import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/FBauthContext/index.jsx";
import { AuthContext } from "../Contexts/FBauthContext/index.jsx";
import { fbDeleteUser } from "../Firebase/auth.js";
import { getAuth } from "firebase/auth";
const auth = getAuth();
const userDeleteManager = async (user) => {
  try {
    // Esto borra el usuario de Firebase
    fbDeleteUser(auth.user, auth.user.email, prompt("confirme su contraseña"));

    //Borra el usuario de la base de datos
    //Obtiene el token de identidad para autenticar al usuario,
    //  refrescando el id para evitar su vencimiento durante el proceso.
    const token = await auth.currentUser.getIdToken(true);
    fetch(`http://localhost:3001/api/user/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${token}`,
      },
      body: JSON.stringify({ email: user.email }),
    });
    console.log("usuario eliminado de la base de datos");
  } catch (err) {
    console.error("FE: Error deleting user:", err);
  }
};
const Main = () => {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate("/")}>HOME</button>
      <div>
        <AuthContext.Consumer>
          {({ value }) => (
            <>
              {value.user && <h1>Borrar Cuenta</h1>}

              {value.user && (
                <button
                  onClick={() => {
                    userDeleteManager(value.user);
                  }}
                >
                  BORRAR CUENTA
                </button>
              )}
            </>
          )}
        </AuthContext.Consumer>
      </div>
    </>
  );
};
export default Main;
