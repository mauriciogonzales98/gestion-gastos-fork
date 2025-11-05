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
  const { token, loadingToken, refreshToken } = useToken();

  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [operations, setOperations] = useState([]);
  const [showOperationModal, setShowOperationModal] = useState(false);

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
        } catch (err) {
          console.log("Error cargando operaciones enriquecidas al main", err);
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
      setShowOperationModal(false); // Cerrar modal después de agregar
    } catch (err) {
      console.log("Error refreshing operations:", err);
      setOperations([]);
    }
  };

  const handleOperationAdded = () => {
    refreshOperations();
    setShowOperationModal(false); // Cerrar modal después de agregar
  };

  return (
    <div className={styles.container}>
      {/* Botón flotante para registrar operación */}
      {selectedWalletId && (
        <button 
          className={styles.floatingButton}
          onClick={() => setShowOperationModal(true)}
        >
          <span className={styles.floatingIcon}>+</span>
          Registrar Operación
        </button>
      )}

      {/* Modal para el formulario de operación */}
      {showOperationModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Registrar Nueva Operación</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowOperationModal(false)}
              >
                ×
              </button>
            </div>
            <OperationForm
              walletId={selectedWalletId}
              token={token}
              onOperationAdded={handleOperationAdded}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.contentGrid}>
        {/* Wallet Selection Card */}
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

        {/* Operations List Card */}
        <div className={styles.operationsListCard}>
          <h2 className={styles.cardTitle}>Historial de Operaciones</h2>
          {selectedWalletId ? (
            operations.length > 0 ? (
              <OperationList
                operations={operations}
                token={token}
                onChange={refreshOperations}
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
  );
};

export default Main;