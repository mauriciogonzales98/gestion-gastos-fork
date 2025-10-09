import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/FBauthContext/index.jsx";
import { AuthContext } from "../Contexts/FBauthContext/index.jsx";
import { fbDeleteUser } from "../Firebase/auth.js";
import CategoryList from "./CategoryForm/CategoryList.jsx";
import { getAuth } from "firebase/auth";

const userDeleteManager = async (user) => {
  try {
    // Esto borra el usuario de Firebase
    const auth = getAuth();
    const user = auth.currentUser;
    fbDeleteUser(user, user.email, prompt("confirme su contraseña"));

    //Borra el usuario de la base de datos
    //Obtiene el token de identidad para autenticar al usuario,
    //  refrescando el id para evitar su vencimiento durante el proceso.
    if (!user) {
      console.error("No user is currently signed in.");
      return;
    }
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetch(`http://localhost:3001/api/user/${user.uid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({ email: user.email }),
    });
    if (response.ok) {
      console.log("usuario eliminado de la base de datos");
    } else {
      const errorData = await response.json();
      console.error(
        "FE: Error eliminando usuario de la base de datos:",
        errorData
      );
    }
  } catch (err) {
    console.error("FE: Error deleting user:", err);
  }
};
const Main = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button onClick={() => navigate("/")}>HOME</button>
      <div>
        <h1>Main Page - Protected Route</h1>
      </div>
      <CategoryList />
      <div>
        {/* <AuthContext.Consumer>
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
        </AuthContext.Consumer> */}
      </div>
    </div>
  );
};
export default Main;
