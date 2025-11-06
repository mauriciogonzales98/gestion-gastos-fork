import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToken } from "../../Contexts/fbTokenContext/TokenContext.jsx";
import OperationList from "../Operation/OperationList.jsx";
import { loadEnrichedOperations } from "../Operation/operationCreate/OperationEnrichManager.jsx";
import styles from "./OperationsPage.module.css";

const OperationsPage = () => {
  const navigate = useNavigate();
  const { token } = useToken();
  
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doRefreshOperations, setDoRefreshOperations] = useState(false);
  
  // Obtener la wallet seleccionada del localStorage
  const [selectedWalletId, setSelectedWalletId] = useState(null);

  // Cargar la wallet seleccionada y sus operaciones
  useEffect(() => {
    const loadSelectedWalletAndOperations = async () => {
      try {
        setLoading(true);
        
        // Obtener la wallet seleccionada del localStorage
        const savedWalletId = localStorage.getItem('selectedWalletId');
        console.log("Wallet ID desde localStorage:", savedWalletId);
        
        // Verificación más robusta
        const isValidWalletId = savedWalletId && 
                               savedWalletId !== "null" && 
                               savedWalletId !== "undefined" && 
                               savedWalletId !== "" &&
                               savedWalletId !== "0";
        
        if (isValidWalletId) {
          setSelectedWalletId(savedWalletId);
          
          // Cargar operaciones de esa wallet
          const enrichedOperations = await loadEnrichedOperations(
            savedWalletId,
            token
          );
          setOperations(enrichedOperations ? enrichedOperations.reverse() : []);
        } else {
          console.log("No hay wallet válida seleccionada");
          setSelectedWalletId(null);
          setOperations([]);
        }
      } catch (err) {
        console.log("Error cargando operaciones:", err);
        setOperations([]);
        setSelectedWalletId(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadSelectedWalletAndOperations();
    }
  }, [token, doRefreshOperations]);

  // Función que refresca las operaciones
  const refreshOperations = () => {
    setDoRefreshOperations(prev => !prev);
  };

  // Función para manejar cuando no hay wallet seleccionada
  const handleGoToMain = () => {
    navigate("/main");
  };

  // DEBUG: Agregar console.log para ver el estado
  useEffect(() => {
    console.log("Estado actual - selectedWalletId:", selectedWalletId, "Tipo:", typeof selectedWalletId);
    console.log("Operaciones cargadas:", operations.length);
  }, [selectedWalletId, operations]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Cargando operaciones...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Operaciones</h1>
        <p className={styles.subtitle}>
        </p>
      </div>

      <div className={styles.content}>
        {selectedWalletId ? (
          operations.length > 0 ? (
            <OperationList
              operations={operations}
              token={token}
              onChange={refreshOperations}
              selectedWalletId={selectedWalletId}
              doRefreshOperations={doRefreshOperations}
              setDoRefreshOperations={setDoRefreshOperations}
              filterEnabled={true}
            />
          ) : (
            <div className={styles.emptyState}>
              <h2>No hay operaciones para mostrar</h2>
              <p>Esta wallet no tiene operaciones registradas</p>
              <button 
                className={styles.homeButton}
                onClick={() => navigate("/main")}
              >
                Ir al Inicio para agregar operaciones
              </button>
            </div>
          )
        ) : (
          <div className={styles.emptyState}>
            <h2>Wallet no seleccionada</h2>
            <p>Para ver operaciones, primero selecciona una wallet en la página principal</p>
            <button 
              className={styles.homeButton}
              onClick={handleGoToMain}
            >
              Seleccionar Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationsPage;