import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/fbAuthContext/index.jsx";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  const { token } = useToken();

  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [operations, setOperations] = useState([]);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Memoizar la función de navegación
  useEffect(() => {
    if (!loggedIn) {
      navigate("/home");
    }
  }, [loggedIn, navigate]);

  // Función memoizada para cargar operaciones
  const loadOperations = useCallback(async (walletId) => {
    if (!walletId) return;
    
    setIsLoading(true);
    try {
      const enrichedOperations = await loadEnrichedOperations(walletId, token);
      setOperations(enrichedOperations.reverse());
    } catch (err) {
      console.log("Error cargando operaciones:", err);
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Cargar operaciones cuando cambia la wallet seleccionada
  useEffect(() => {
    if (selectedWalletId) {
      loadOperations(selectedWalletId);
    } else {
      setOperations([]);
    }
  }, [selectedWalletId, loadOperations]);

  // Función memoizada para refrescar operaciones
  const refreshOperations = useCallback(async () => {
    if (!selectedWalletId) return;
    await loadOperations(selectedWalletId);
  }, [selectedWalletId, loadOperations]);

  // Función memoizada para manejar operación agregada
  const handleOperationAdded = useCallback(() => {
    refreshOperations();
    setShowOperationModal(false);
  }, [refreshOperations]);

  // Memoizar el contenido del historial para evitar re-renders
  const operationsContent = useMemo(() => {
    if (!selectedWalletId) {
      return (
        <div className={styles.emptyState}>
          <h3>Wallet no seleccionada</h3>
          <p>Selecciona una wallet para ver las operaciones</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={styles.emptyState}>
          <h3>Cargando...</h3>
          <p>Obteniendo operaciones</p>
        </div>
      );
    }

    if (operations.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h3>No hay operaciones</h3>
          <p>Comienza registrando tu primera operación</p>
        </div>
      );
    }

    return (
      <OperationList
        operations={operations}
        token={token}
        onChange={refreshOperations}
      />
    );
  }, [selectedWalletId, isLoading, operations, token, refreshOperations]);

  // Memoizar el botón flotante
  const floatingButton = useMemo(() => {
    if (!selectedWalletId) return null;
    
    return (
      <button 
        className={styles.floatingButton}
        onClick={() => setShowOperationModal(true)}
      >
        <span className={styles.floatingIcon}>+</span>
        Registrar Operación
      </button>
    );
  }, [selectedWalletId]);

  // Memoizar el modal
  const operationModal = useMemo(() => {
    if (!showOperationModal) return null;

    return (
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
    );
  }, [showOperationModal, selectedWalletId, token, handleOperationAdded]);

  return (
    <div className={styles.container}>
      {floatingButton}
      {operationModal}

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
          {operationsContent}
        </div>
      </div>
    </div>
  );
};

export default Main;