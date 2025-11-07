import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import styles from './MercadoPagoSync.module.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const MercadoPagoSync = () => {
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Obtener token
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      user.getIdToken().then((t) => {
        setToken(t);
      });
    }
  }, []);

  // ✅ CORREGIDO: checkConnectionStatus dentro de useEffect
  useEffect(() => {
    if (!token) return;

    const checkConnectionStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/mercado-pago/connection-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setConnectionStatus(data.data);
        
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    };

    checkConnectionStatus();
  }, [token]); // ✅ Se ejecuta cuando el token cambia

  // Conectar con Mercado Pago
  const connectMercadoPago = useCallback(async () => {
    if (!token) {
      setError("No hay token. Por favor, inicia sesión primero.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/mercado-pago/initiate-oauth`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        throw new Error("No se pudo obtener la URL de autorización");
      }
      
    } catch (err) {
      const errorMessage = err.message || "Error al iniciar conexión";
      setError(errorMessage);
      console.error("Error en OAuth:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Sincronizar movimientos
  const syncMovements = useCallback(async () => {
    if (!token) {
      setError("No hay token. Por favor, inicia sesión primero.");
      return;
    }

    setSyncLoading(true);
    setError("");
    setResult(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/mercado-pago/sync-movements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      // ✅ Actualizar estado de conexión después de sincronizar
      if (token) {
        const updateStatus = async () => {
          try {
            const statusResponse = await fetch(`${API_BASE}/api/mercado-pago/connection-status`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              setConnectionStatus(statusData.data);
            }
          } catch (err) {
            console.error("Error updating connection status:", err);
          }
        };
        updateStatus();
      }
      
    } catch (err) {
      const errorMessage = err.message || "Error al sincronizar";
      setError(errorMessage);
      console.error("Error en sincronización:", err);
    } finally {
      setSyncLoading(false);
    }
  }, [token]);

  // Verificar si viene del callback de OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mpSuccess = urlParams.get('mp_success');
    const mpError = urlParams.get('mp_error');
    
    if (mpSuccess || mpError) {
      // ✅ Actualizar estado de conexión cuando vuelve de OAuth
      if (token) {
        const updateStatus = async () => {
          try {
            const response = await fetch(`${API_BASE}/api/mercado-pago/connection-status`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (response.ok) {
              const data = await response.json();
              setConnectionStatus(data.data);
            }
          } catch (err) {
            console.error("Error updating connection status:", err);
          }
        };
        updateStatus();
      }
      
      if (mpSuccess) {
        setResult({
          success: true,
          message: "✅ Cuenta de Mercado Pago conectada exitosamente"
        });
      } else if (mpError) {
        setError(`❌ Error conectando con MP: ${decodeURIComponent(mpError)}`);
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [token]); // ✅ Dependencia de token

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h3>🔐 Autenticación Requerida</h3>
          <p>Debes iniciar sesión para usar esta función.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Estado de conexión */}
      <div className={styles.connectionStatus}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Estado:</span>
          <span className={`${styles.statusValue} ${
            connectionStatus?.connected ? styles.connected : styles.notConnected
          }`}>
            {connectionStatus?.connected ? "✅ Conectado" : "❌ No conectado"}
          </span>
        </div>
        
        {connectionStatus?.expiresAt && (
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Token expira:</span>
            <span className={styles.statusValue}>
              {new Date(connectionStatus.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {connectionStatus?.lastSyncAt && (
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Última sync:</span>
            <span className={styles.statusValue}>
              {new Date(connectionStatus.lastSyncAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Botones principales */}
      <div className={styles.actions}>
        <button
          onClick={connectMercadoPago}
          disabled={loading || connectionStatus?.connected}
          className={`${styles.button} ${styles.primaryButton} ${
            connectionStatus?.connected ? styles.disabledButton : ''
          } ${loading ? styles.loading : ''}`}
        >
          {loading ? "⏳ Conectando..." : 
           connectionStatus?.connected ? "✅ Cuenta Conectada" : "🔗 Conectar Mercado Pago"}
        </button>

        <button
          onClick={syncMovements}
          disabled={syncLoading || !connectionStatus?.connected}
          className={`${styles.button} ${styles.secondaryButton} ${syncLoading ? styles.loading : ''}`}
        >
          {syncLoading ? "⏳ Sincronizando..." : "🔄 Importar Movimientos"}
        </button>
      </div>

      {/* Resultados */}
      {result && (
        <div className={`${styles.result} ${styles.success}`}>
          <strong>✅ {result.message}</strong>
          {result.data?.imported !== undefined && (
            <div className={styles.importedInfo}>
              <strong>Movimientos importados:</strong> {result.data.imported}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className={`${styles.result} ${styles.error}`}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Información de última sincronización */}
      {result?.data?.lastSyncAt && (
        <div className={styles.lastSync}>
          <strong>Última sincronización:</strong> {new Date(result.data.lastSyncAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default MercadoPagoSync;