import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/authContext/index.jsx";
import { AuthContext } from "../Contexts/authContext/index.jsx";
import { doDeleteUser } from "../Firebase/auth.js";
import { getAuth } from "firebase/auth";
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
                  onClick={(currentUser) => {
                    try {
                      // Esto borra el usuario de Firebase
                      const auth = getAuth();
                      doDeleteUser(
                        auth.currentUser,
                        auth.currentUser.email,
                        prompt("confirme su contraseña")
                      );
                      // Esto borra el usuario de la base de datos
                      fetch(
                        `http://localhost:3001/api/user/${currentUser.uid}`,
                        {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${value.token}`,
                          },
                          body: JSON.stringify({ uid: currentUser.uid }),
                        }
                      );
                      console.log("usuario eliminado de la base de datos");
                    } catch (err) {
                      console.error("FE: Error deleting user:", err);
                    }
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
