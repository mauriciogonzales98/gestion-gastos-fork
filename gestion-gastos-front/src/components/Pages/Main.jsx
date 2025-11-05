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
  const { loggedIn, user } = useAuth();
  const currentUser = getAuth().currentUser;

  const { token, loadingToken, refreshToken } = useToken();

  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [operations, setOperations] = useState([]);
  const [doRefreshOperations, setDoRefreshOperations] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      navigate("/home");
      return;
    }
  }, [loggedIn, navigate]);

  // Cuando se selecciona una wallet, carga todas las operaciones
  useEffect(() => {
    const operationsLoader = async () => {
      if (selectedWalletId) {
        try {
          const enrichedOperations = await loadEnrichedOperations(
            selectedWalletId,
            token
          );
          setOperations(enrichedOperations.reverse());
          console.log("Operaciones cargadas:", enrichedOperations);
        } catch (err) {
          console.log("Error cargando operaciones enriquecidas al main", err);
          setOperations([]);
        }
      }
    };
    operationsLoader();
  }, [selectedWalletId, token, doRefreshOperations]);

  // Función que refresca las operaciones
  const refreshOperations = () => {
    setDoRefreshOperations(prev => !prev);
  };

  return (
    <div className={styles.container}>
      {/* Layout Vertical - Arriba: Wallet y Form, Abajo: Historial */}
      <div className={styles.verticalLayout}>
        
        {/* Sección Superior: Wallet Selection y Operation Form */}
        <div className={styles.topSection}>
          <div className={styles.topGrid}>
            {/* Wallet Selection */}
            <div className={styles.walletCard}>
              <h2 className={styles.cardTitle}>Seleccionar Wallet</h2>
              <div className={styles.walletSelector}>
                <WalletLoading
                  token={token}
                  selectedWalletId={selectedWalletId}
                  setSelectedWalletId={setSelectedWalletId}
                />
              </div>
            </div>

            {/* Operation Form - MÁS GRANDE */}
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

        {/* Sección Inferior: Historial de Operaciones con Filtros */}
        <div className={styles.bottomSection}>
          <div className={styles.operationsListCard}>
            <h2 className={styles.cardTitle}>Historial de Operaciones</h2>
            {selectedWalletId ? (
              operations.length > 0 ? (
                <OperationList
                  operations={operations}
                  token={token}
                  onChange={refreshOperations}
                  selectedWalletId={selectedWalletId}
                  doRefreshOperations={doRefreshOperations}
                  setDoRefreshOperations={setDoRefreshOperations}
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
      </div>
    </div>
  );
};

export default Main;