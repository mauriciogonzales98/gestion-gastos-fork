import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/FBauthContext/index.jsx";
import { AuthContext } from "../Contexts/FBauthContext/index.jsx";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useToken } from "../Contexts/tokenContext/TokenContext.jsx";

import DeleteAccount from "./UserUpdate.jsx/UserDeleteManager.jsx";
import { PasswordInput } from "./Registration/PasswordInputs.jsx";
import ChangePassword from "./UserUpdate.jsx/PasswordChangeManager.jsx";
import ChangeEmail from "./UserUpdate.jsx/EmailChangeManager.jsx";

import OperationForm from "./Operation/OperationForm.jsx";
import OperationList from "./Operation/OperationList.jsx";

import WalletLoading from "./Wallet/WalletLoading.jsx";
import styles from "./Wallet/WalletSelector.module.css";

const Main = () => {
  const navigate = useNavigate();
  const { loggedIn, user } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Uso hook de la token
  const { token, loadingToken, refreshToken } = useToken();

  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [loadingWallets, setLoadingWallets] = useState(true);
  //const [token, setToken] = useState(null);
  const [operations, setOperations] = useState([]);
  const [loadingOperations, setLoadingOperations] = useState(false);

  // Determina si el usuario está registrado por Google para evitar que intente cambiar la contraseña.
  const isGoogleUser = getAuth().currentUser?.providerData.some(
    (provider) => provider.providerId === "google.com"
  );
  useEffect(() => {
    if (!loggedIn) {
      navigate("/home");
      return;
    }
  }, [loggedIn, navigate]);
  // useEffect(() => {
  //   const getToken = async () => {
  //     if (user) {
  //       try {
  //         const auth = getAuth();
  //         const currentUser = auth.currentUser;
  //         if (currentUser) {
  //           const userToken = await currentUser.getIdToken();
  //           setToken(userToken);

  //           const googleUser = currentUser.providerData.some(
  //             (provider) => provider.providerId === "google.com"
  //           );
  //           setIsGoogleUser(googleUser);
  //         }
  //       } catch (error) {
  //         console.error("Error getting token:", error);
  //       }
  //     }
  //   };

  //   getToken();
  // }, [user]);

  const loadOperations = async (walletId) => {
    if (!walletId || !token) return;
    try {
      setLoadingOperations(true);
      const response = await fetch(
        `http://localhost:3001/api/operation/wallet/${walletId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const operationsData = await response.json();
        setOperations(operationsData.data.reverse());
      }
    } catch (error) {
      console.error("Error loading operations:", error);
    } finally {
      setLoadingOperations(false);
    }
  };

  useEffect(() => {
    if (selectedWalletId) {
      loadOperations(selectedWalletId);
    }
  }, [selectedWalletId, token]);

  if (!loggedIn) {
    return null;
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1>Main Page - Protected Route</h1>
        {user && <p style={{ color: "#666" }}>Bienvenido, {user.email}</p>}
      </div>
      <div className={styles.container}>
        <div className={styles.header}>
          <WalletLoading
            token={token}
            selectedWalletId={selectedWalletId}
            setSelectedWalletId={setSelectedWalletId}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginBottom: "30px",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "1200px", maxWidth: "100%" }}>
          <OperationForm
            walletId={selectedWalletId}
            token={token}
            onOperationAdded={() => {
              loadOperations(selectedWalletId);
            }}
          />
        </div>
      </div>

      <div>
        <OperationList
          operations={operations}
          token={token}
          onDelete={() => {
            loadOperations(selectedWalletId);
          }}
        />
      </div>

      <div
        style={{
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
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

              {/* Comienzo del JSX para cambio de email, temporalmente deshabilitado


              {value.user && <h1>Cambiar Email</h1>}
              {value.user && !isChangingEmail && (
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                      userDeleteManager();
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Cambiar Email
                </button>
              )}
              {isChangingEmail && (
                <ChangeEmail
                  setIsChangingEmail={setIsChangingEmail}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                  onSuccess={() => navigate("/")}
                  onCancel={() => setIsChangingEmail(false)}
                />
              )}
              
              */}
            </>
          )}
        </AuthContext.Consumer>
      </div>
    </div>
  );
};

export default Main;
