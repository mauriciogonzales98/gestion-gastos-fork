import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/fbAuthContext/index.jsx";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useToken } from "../../Contexts/fbTokenContext/TokenContext.jsx";

import OperationForm from "../Operation/operationCreate/OperationForm.jsx";
import OperationList from "../Operation/OperationList.jsx";
import WalletLoading from "../Wallet/WalletLoading.jsx";
import styles from "./Main.module.css";

import {
  loadEnrichedOperations,
} from "../Operation/operationCreate/OperationEnrichManager.jsx";

const Main = () => {
  const navigate = useNavigate();
  const { loggedIn } = useAuth();
  const currentUser = getAuth().currentUser;

  const { token } = useToken();

  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [operations, setOperations] = useState([]);
  const [doRefreshOperations, setDoRefreshOperations] = useState(false);

  const handleWalletSelect = (walletId) => {
    setSelectedWalletId(walletId);
    localStorage.setItem('selectedWalletId', walletId);
    console.log("Wallet guardada en localStorage:", walletId);
  };

  // // Cargar wallet del localStorage al iniciar (opcional)
  // useEffect(() => {
  //   const savedWalletId = localStorage.getItem('selectedWalletId');
  //   if (savedWalletId && savedWalletId !== "null" && savedWalletId !== "undefined") {
  //     setSelectedWalletId(savedWalletId);
  //     console.log("Wallet cargada desde localStorage:", savedWalletId);
  //   }
  // }, []);

  useEffect(() => {
    if (!loggedIn) {
      navigate("/home");
      return;
    }
  }, [loggedIn, navigate]);

  useEffect(() => {
    const operationsLoader = async () => {
      if (selectedWalletId) {
        try {
          const enrichedOperations = await loadEnrichedOperations(
            selectedWalletId,
            token
          );
          setOperations(enrichedOperations || []); // 🔥 Asegurar que siempre sea un array
          console.log("Operaciones cargadas:", enrichedOperations);
        } catch (err) {
          console.log("Error cargando operaciones enriquecidas al main", err);
          setOperations([]); // 🔥 En caso de error, establecer array vacío
        }
      }
    };
    operationsLoader();
  }, [selectedWalletId, token, doRefreshOperations]);

  const refreshOperations = () => {
    setDoRefreshOperations(prev => !prev);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainGrid}>
        
        {/* Columna Izquierda: Wallet y OperationList */}
        <div className={styles.leftColumn}>
          {/* Wallet Selection */}
          <div className={styles.walletCard}>
            <h2 className={styles.cardTitle}>Seleccionar Wallet</h2>
            <div className={styles.walletSelector}>
              <WalletLoading
                token={token}
                selectedWalletId={selectedWalletId}
                setSelectedWalletId={handleWalletSelect}  
              />
            </div>
          </div>

          {/* OperationList debajo de Wallet */}
          <div className={styles.operationsListCard}>
            <h2 className={styles.cardTitle}>Tus últimas operaciones</h2>
            {selectedWalletId ? (
              operations && operations.length > 0 ? ( // 🔥 VERIFICAR que operations existe Y tiene length
                <OperationList
                  operations={operations}
                  token={token}
                  onChange={refreshOperations}
                  selectedWalletId={selectedWalletId}
                  doRefreshOperations={doRefreshOperations}
                  setDoRefreshOperations={setDoRefreshOperations}
                  filterEnabled={false}
                />
              ) : (
                <div className={styles.emptyState}>
                  <h3>No hay operaciones</h3>
                  <p>Comienza registrando tu primera operación</p>
                </div>
              )
            ) : (
              <div className={styles.emptyState}>
                <h3>Wallet no seleccionada</h3>
                <p>Selecciona una wallet para ver las operaciones</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Operation Form */}
        <div className={styles.rightColumn}>
          <div className={`${styles.operationCard} ${styles.largeOperationCard}`}>
            <h2 className={styles.cardTitle}>Registrar Operación</h2>
            {selectedWalletId ? (
              <OperationForm
                walletId={selectedWalletId}
                token={token}
                onOperationAdded={refreshOperations}
                doRefreshOperations={doRefreshOperations}
                setDoRefreshOperations={setDoRefreshOperations}
              />
            ) : (
              <div className={styles.emptyState}>
                <h3>Selecciona una Wallet</h3>
                <p>Para registrar operaciones, primero selecciona una wallet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;