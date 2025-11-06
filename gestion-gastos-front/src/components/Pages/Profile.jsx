import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useToken } from "../../Contexts/fbTokenContext/TokenContext.jsx";
import { AuthContext } from "../../Contexts/fbAuthContext/index.jsx";
import { useNavigate } from "react-router-dom";

import DeleteAccount from "../User/userDelete/UserDeleteManager.jsx";
import { PasswordInput } from "../Login/PasswordInputs.jsx";
import ChangePassword from "../User/userUpdate/PasswordChangeManager.jsx";
import ChangeEmail from "../User/userUpdate/EmailChangeManager.jsx";
import FullNameChange from "../User/userUpdate/FullNameChangeManager.jsx";
import MercadoPagoSync from "../User/userMercadoPago/MercadoPagoSync.jsx";

const Profile = () => {
  // El usuario actual, traído de FB
  const currentUser = getAuth().currentUser;
  //CAMBIO DE NOMBRE Y APELLIDO
  const [isChangingFullName, setIsChangingFullName] = useState(false);
  // const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  //BORRADO DE CUENTA
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // CAMBIO DE CONTRASEÑA
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  // Determina si el usuario está registrado por Google para evitar que intente cambiar la contraseña. Usa getAuth().currentUser
  const isGoogleUser = currentUser?.providerData.some(
    (provider) => provider.providerId === "google.com"
  );
  const navigate = useNavigate();
  return (
    <>
      {errorMessage && <div>{errorMessage}</div>}
      <AuthContext.Consumer>
        {(value) => (
          <>

            <div>
              <h2>Sincronización con Mercado Pago</h2>
              <MercadoPagoSync />
            </div>
            <div>
              {/* COMIENZO del JSX para borrado de cuenta */}
              {/* Botón que abre el formulario de Borrado de Cuenta */}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setIsDeletingAccount(true);
                }}
              >
                BORRAR CUENTA
              </button>

              {/* Formulario de eliminación de cuenta*/}
              {isDeletingAccount && (
                <DeleteAccount
                  setIsDeletingAccount={setIsDeletingAccount}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                  //   onSuccess={() => navigate("/")}
                  onCancel={() => setIsDeletingAccount(false)}
                  isGoogleUser={isGoogleUser}
                />
              )}
            </div>
            {/* FIN del JSX para borrado de cuenta */}
            {/*COMIENZO del JSX para cambio de contraseña*/}
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
                  setErrorMessage(null);
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
                // onSuccess={() => navigate("/")}
                onCancel={() => setIsChangingPassword(false)}
              />
            )}
            {/* FIN del JSX para cambio de contraseña */}
            {/* COMIENZO del JSX para cambio de nombre y apellido */}
            <h1>CAMBIAR NOMBRE Y APELLIDO</h1>
            <button
              onClick={() => {
                setErrorMessage(null);
                setIsChangingFullName(true);
              }}
            >
              CAMBIAR NOMBRE Y APELLIDO
            </button>
            {isChangingFullName && (
              <FullNameChange
                onCancel={() => {
                  setIsChangingFullName(false);
                }}
                userId={currentUser.uid}
              />
            )}
            {/* FIN del JSX para cambio de nombre y apellido */}
          </>
        )}
      </AuthContext.Consumer>
    </>
  );
};

export default Profile;
