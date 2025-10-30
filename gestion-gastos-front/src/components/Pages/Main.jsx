import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/fbAuthContext/index.jsx";
import { AuthContext } from "../../Contexts/fbAuthContext/index.jsx";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useToken } from "../../Contexts/fbTokenContext/TokenContext.jsx";

// import DeleteAccount from "../User/userDelete/UserDeleteManager.jsx";
// import { PasswordInput } from "../Login/PasswordInputs.jsx";
// import ChangePassword from "../User/userUpdate/PasswordChangeManager.jsx";
// import ChangeEmail from "../User/userUpdate/EmailChangeManager.jsx";

import OperationForm from "../Operation/operationCreate/OperationForm.jsx";
import OperationList from "../Operation/OperationList.jsx";

import WalletLoading from "../Wallet/WalletLoading.jsx";
import styles from "../Wallet/WalletSelector.module.css";

import {
  loadEnrichedOperations,
  loadOperations,
} from "../Operation/operationCreate/OperationEnrichManager.jsx";
import CategoryList from "../Category/CategoryForm/CategoryList.jsx";

const Main = () => {
  const navigate = useNavigate();
  const { loggedIn, user } = useAuth();
  // El usuario actual, traído de FB
  const currentUser = getAuth().currentUser;

  // Uso hook de la token
  const { token, loadingToken, refreshToken } = useToken();

  // Estados para la selección de wallet y carga de sus operaciones
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [loadingWallets, setLoadingWallets] = useState(true);
  //const [token, setToken] = useState(null);
  const [operations, setOperations] = useState([]);

  useEffect(() => {
    if (!loggedIn) {
      navigate("/home");
      return;
    }
  }, [loggedIn, navigate]);

  //Cuando se selecciona una wallet, carga todas las operaciones, cargando las categorías e insertandolas en el objeto
  useEffect(() => {
    const operationsLoader = async () => {
      if (selectedWalletId) {
        try {
          const enrichedOperations = await loadEnrichedOperations(
            selectedWalletId,
            token
          );
          setOperations(enrichedOperations.reverse());
          console.log(
            "Operaciones seleccionadas en operationsLoader:",
            enrichedOperations
          );
        } catch (err) {
          console.log("Error cargando operaciones enriqucidas al main", err);
          setOperations([]);
        }
      }
    };
    operationsLoader();
  }, [selectedWalletId, token]);
  // Función que refresca las operaciones
  const refreshOperations = async () => {
    if (!selectedWalletId) return;
    try {
      const enrichedOperations = await loadEnrichedOperations(
        selectedWalletId,
        token
      );
      setOperations(enrichedOperations);
    } catch (err) {
      console.log("Error refreshing operations:", err);
      setOperations([]);
    }
  };
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
              refreshOperations();
            }}
          />
        </div>
      </div>

      <div>
        <OperationList
          operations={operations}
          token={token}
          onChange={() => {
            refreshOperations();
          }}
        />
      </div>

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
    </div>
  );
};

export default Main;
