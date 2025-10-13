import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/FBauthContext/index.jsx";
import { AuthContext } from "../Contexts/FBauthContext/index.jsx";
import { getAuth } from "firebase/auth";

import CategoryList from "./CategoryForm/CategoryList.jsx";

import { useEffect, useState } from "react";
import DeleteAccount from "./UserDeleteManager.jsx";

import { PasswordInput } from "./Registration/PasswordInputs.jsx";
import ChangePassword from "./PasswordChangeManager.jsx";

// Variables para userDeleteManager y passwordChangeManager
// BORRADO DE CUENTA

const Main = () => {
  const navigate = useNavigate();
  const { loggedIn } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Determina si el usuario está registrado por Google para evitar que intente cambiar la contraseña.
  const isGoogleUser = getAuth().currentUser?.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  useEffect(() => {
    if (!loggedIn) {
      navigate("/home");
    }
  }, [loggedIn, navigate]);

  if (!loggedIn) {
    return null;
  }

  return (
    <div>
      <h1>Main Page - Protected Route</h1>
      <div>
        {errorMessage && (
          <p
            className="error-message"
            style={{ color: "brown", backgroundColor: "lightyellow" }}
          >
            {errorMessage}
          </p>
        )}
      </div>

      <CategoryList />
      {/*Comienzo del JSX para borrado de cuenta*/}
      <div>
        <AuthContext.Consumer>
          {(value) => (
            <>
              <div>
                {/* Botón que abre el formulario */}
                <button onClick={() => setIsDeletingAccount(true)}>
                  BORRAR CUENTA
                </button>

                {/* Formulario de eliminación */}
                {isDeletingAccount && (
                  <DeleteAccount
                    setIsDeletingAccount={setIsDeletingAccount}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                    onSuccess={() => navigate("/")}
                    onCancel={() => setIsDeletingAccount(false)}
                    isGoogleUser={isGoogleUser}
                  />
                )}
              </div>

              {/*Comienzo del JSX para cambio de contraseña*/}
              {value.user && <h1>Cambiar Contraseña</h1>}
              {value.user && !isChangingPassword && (
                <button
                  onClick={() => {
                    // Evita que los usuarios de Google modifiquen su contraseña
                    //Seguramente deba ir en otro lado.
                    if (isGoogleUser) {
                      setErrorMessage(
                        "Los usuarios de Google no necesitan modificar su contraseña"
                      );
                      return;
                    }
                    setIsChangingPassword(true);
                  }}
                >
                  Cambiar Contraseña
                </button>
              )}
              {isChangingPassword && (
                <ChangePassword
                  setIsChangingPassword={setIsChangingPassword}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                  onSuccess={() => navigate("/")}
                  onCancel={() => setIsChangingPassword(false)}
                />
              )}
            </>
          )}
        </AuthContext.Consumer>
      </div>
    </div>
  );
};
export default Main;
