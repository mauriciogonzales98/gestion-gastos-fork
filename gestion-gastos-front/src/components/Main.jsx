import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/FBauthContext/index.jsx";
import { AuthContext } from "../Contexts/FBauthContext/index.jsx";
import { fbDeleteUser } from "../Firebase/auth.js";
import CategoryList from "./CategoryForm/CategoryList.jsx";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const userDeleteManager = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const isGoogleUser = user.providerData.some(
    (provider) => provider.providerId === "google.com"
  );
  try {
    //Obtiene el token de identidad para autenticar al usuario,
    //  refrescando el id para evitar su vencimiento durante el proceso.
    if (!user) {
      console.error("No user is currently signed in.");
      throw new Error("No hay usuario autenticado");
    }

    if (!isGoogleUser) {
      // Pide contraseña por seguridad
      const password = prompt(
        "Por favor ingresa tu contraseña para confirmar la eliminación de tu cuenta:"
      );
      if (!password) {
        throw new Error("Se requiere contraseña para eliminar la cuenta");
      }
    }
    // Autentica al usuario a través de Firebase Auth

    if (isGoogleUser) {
      try {
        console.log("obteniendo provider");
        const provider = new GoogleAuthProvider();

        console.log("Provider obtenido)");

        // Forzar la selección de cuenta para re-autenticación
        //provider.setCustomParameters({ prompt: "select_account" });

        console.log("Parametros seteados correctamente");

        await reauthenticateWithPopup(user, provider);
        console.log("reautenticando...");

        console.log("Usuario de Google re-autenticado");
      } catch (error) {
        console.error("Error re-autenticando con Google:", error);
        throw new Error(
          "Necesitas re-autenticarte con Google para eliminar tu cuenta"
        );
      }
    } else {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    }

    // Refresca y obtiene el token de identidad
    const token = await user.getIdToken(true);

    // Fetch que elimina al usuario del BE
    const response = await fetch(`http://localhost:3001/api/user/${user.uid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log("usuario eliminado de la base de datos");

      // Esto borra el usuario de Firebase, se llama una vez el usuario fue elminado del BE
      await fbDeleteUser(user);
    } else {
      const errorData = await response.json();
      console.error(
        "FE: Error eliminando usuario de la base de datos:",
        errorData
      );
    }
  } catch (err) {
    console.error("FE: Error eliminando usuario:", err);
  }
};

const Main = () => {
  const navigate = useNavigate();
  const { loggedIn } = useAuth();

  useEffect(() => {
    if (!loggedIn) {
      navigate("/home");
    }
  }, [loggedIn, navigate]);

  if(!loggedIn){
    return null;
  }

  return (
    <div>
      <div>
        <h1>Main Page - Protected Route</h1>
      </div>
      <CategoryList />
      <div>
        <AuthContext.Consumer>
          {({ value }) => (
            <>
              {value.user && <h1>Borrar Cuenta</h1>}

              {value.user && (
                <button
                  onClick={() => {
                    userDeleteManager();
                  }}
                >
                  BORRAR CUENTA
                </button>
              )}
            </>
          )}
        </AuthContext.Consumer>
      </div>
    </div>
  );
};
export default Main;
