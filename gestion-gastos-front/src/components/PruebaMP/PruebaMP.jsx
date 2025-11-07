import React, { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const SyncMercadoPago = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  // Obtener token
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      user.getIdToken().then((t) => {
        setToken(t);
        setDebugInfo("✅ Token cargado desde Firebase");
        checkConnectionStatus();
      }).catch(err => {
        setDebugInfo("❌ Error obteniendo token: " + err.message);
      });
    } else {
      setDebugInfo("❌ No hay usuario autenticado");
    }
  }, []);

  // Verificar estado de conexión
  const checkConnectionStatus = useCallback(async () => {
    if (!token) return;

    try {
      setDebugInfo("🔍 Verificando estado de conexión...");
      
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
      setDebugInfo("✅ Estado actualizado");
      
    } catch (err) {
      console.error("Error checking connection:", err);
      setDebugInfo("❌ Error verificando estado: " + err.message);
    }
  }, [token]);

  // Iniciar flujo OAuth
  const initiateOAuth = useCallback(async () => {
    if (!token) {
      setError("No hay token. Por favor, inicia sesión primero.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      setDebugInfo("🚀 Iniciando conexión con Mercado Pago...");
      
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
        setDebugInfo("✅ Redirigiendo a Mercado Pago...");
        window.location.href = data.data.authUrl;
      } else {
        throw new Error("No se pudo obtener la URL de autorización");
      }
      
    } catch (err) {
      const errorMessage = err.message || "Error al iniciar conexión";
      setError(errorMessage);
      setDebugInfo(`❌ Error: ${errorMessage}`);
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

    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      setDebugInfo("🔄 Sincronizando movimientos...");
      
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
      setDebugInfo(`✅ Sincronización completada. ${data.data?.imported || 0} movimientos importados.`);
      
      checkConnectionStatus();
      
    } catch (err) {
      const errorMessage = err.message || "Error al sincronizar";
      setError(errorMessage);
      setDebugInfo(`❌ Error en sincronización: ${errorMessage}`);
      console.error("Error en sincronización:", err);
    } finally {
      setLoading(false);
    }
  }, [token, checkConnectionStatus]);

  // Conexión directa
  const connectDirectly = async () => {
    if (!token) {
      setSyncResult({
        success: false,
        message: "No hay token de autenticación. Por favor, inicia sesión."
      });
      return;
    }

    try {
      setLoading(true);
      setSyncResult(null);
      setDebugInfo("🔄 Conectando con Mercado Pago...");
      
      const response = await fetch(`${API_BASE}/api/mercado-pago/connect-directly`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      setSyncResult(result);
      setDebugInfo(result.success ? "✅ Conexión exitosa" : "❌ Error en conexión");
      
    } catch (error) {
      console.error('Error en conexión directa:', error);
      setSyncResult({
        success: false,
        message: 'Error de conexión con el servidor: ' + error.message
      });
      setDebugInfo("❌ Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar token MP
  const verifyToken = async () => {
    if (!token) return;

    try {
      setDebugInfo("🔐 Verificando token de Mercado Pago...");
      
      const response = await fetch(`${API_BASE}/api/mercado-pago/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setDebugInfo(data.success ? "✅ Token MP válido" : "❌ Token MP inválido");
      
    } catch (err) {
      console.error("Error verificando token:", err);
      setDebugInfo("❌ Error verificando token MP");
    }
  };

  // Función para probar pagos
  const testPayments = async () => {
    if (!token) return;

    try {
      setDebugInfo("🧪 Probando endpoint de pagos...");
      
      const response = await fetch(`${API_BASE}/api/mercado-pago/test-payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setDebugInfo(data.success ? 
        `✅ Pagos funcionan (${data.data?.paymentsCount || 0} resultados)` : 
        "❌ Error en pagos"
      );
      
    } catch (err) {
      console.error("Error probando pagos:", err);
      setDebugInfo("❌ Error probando pagos");
    }
  };

  // Limpiar resultados
  const clearResults = () => {
    setResult(null);
    setError("");
    setSyncResult(null);
    setDebugInfo(token ? "✅ Token listo para usar" : "❌ No hay token");
  };

  // Verificar si viene del callback de OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mpSuccess = urlParams.get('mp_success');
    const mpError = urlParams.get('mp_error');
    
    if (mpSuccess) {
      setResult({
        success: true,
        message: "✅ Cuenta de Mercado Pago conectada exitosamente"
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => checkConnectionStatus(), 1000);
    } else if (mpError) {
      setError(`❌ Error conectando con MP: ${decodeURIComponent(mpError)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkConnectionStatus]);

  // Si no hay token, mostrar mensaje
  if (!token) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>🔗 Conectar con Mercado Pago</h2>
        <div style={{ 
          padding: "20px", 
          backgroundColor: "#fff3cd", 
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
          color: "#856404",
          margin: "20px 0"
        }}>
          <h3>🔐 Autenticación Requerida</h3>
          <p>Debes iniciar sesión para usar esta función.</p>
          <p><strong>Estado:</strong> {debugInfo}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "800px", 
      margin: "0 auto",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ color: "#333", borderBottom: "2px solid #007bff", paddingBottom: "10px" }}>
        🔗 Sincronizar con Mercado Pago
      </h1>

      {/* Información de estado */}
      <div style={{ 
        padding: "15px", 
        backgroundColor: "#d1ecf1", 
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <h4>🔍 Estado del Sistema</h4>
        <p><strong>Token:</strong> ✅ Presente</p>
        <p><strong>Información:</strong> {debugInfo}</p>
        
        {connectionStatus && (
          <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "white", borderRadius: "4px" }}>
            <p>
              <strong>Conexión MP:</strong> 
              <span style={{ 
                color: connectionStatus.connected ? "#28a745" : "#dc3545",
                fontWeight: "bold",
                marginLeft: "10px"
              }}>
                {connectionStatus.connected ? "✅ CONECTADO" : "❌ NO CONECTADO"}
              </span>
            </p>
            {connectionStatus.expiresAt && (
              <p><strong>Expira:</strong> {new Date(connectionStatus.expiresAt).toLocaleDateString()}</p>
            )}
            {connectionStatus.lastSyncAt && (
              <p><strong>Última sync:</strong> {new Date(connectionStatus.lastSyncAt).toLocaleString()}</p>
            )}
          </div>
        )}
        
        {/* Botones de utilidad */}
        <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button 
            onClick={clearResults}
            style={{ 
              padding: "5px 10px", 
              backgroundColor: "#6c757d", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Limpiar
          </button>
          
          <button 
            onClick={checkConnectionStatus}
            disabled={loading}
            style={{ 
              padding: "5px 10px", 
              backgroundColor: "#17a2b8", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "12px"
            }}
          >
            🔄 Estado
          </button>

          <button 
            onClick={verifyToken}
            disabled={loading || !connectionStatus?.connected}
            style={{ 
              padding: "5px 10px", 
              backgroundColor: "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: (loading || !connectionStatus?.connected) ? "not-allowed" : "pointer",
              fontSize: "12px"
            }}
          >
            🔐 Verificar Token
          </button>

          <button 
            onClick={testPayments}
            disabled={loading || !connectionStatus?.connected}
            style={{ 
              padding: "5px 10px", 
              backgroundColor: "#ffc107", 
              color: "black", 
              border: "none", 
              borderRadius: "4px",
              cursor: (loading || !connectionStatus?.connected) ? "not-allowed" : "pointer",
              fontSize: "12px"
            }}
          >
            🧪 Probar Pagos
          </button>

          <button 
            onClick={connectDirectly} 
            disabled={loading}
            style={{ 
              padding: "5px 10px", 
              backgroundColor: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "12px"
            }}
          >
            🔗 Conexión Directa
          </button>
        </div>
      </div>

      {/* Acciones principales */}
      <div style={{ 
        padding: "15px", 
        backgroundColor: "#e7f3ff", 
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <h3>🚀 Acciones</h3>
        
        {/* Conectar cuenta */}
        <div style={{ marginBottom: "15px" }}>
          <button 
            onClick={initiateOAuth} 
            disabled={loading || (connectionStatus && connectionStatus.connected)}
            style={{ 
              padding: "12px 24px", 
              backgroundColor: connectionStatus?.connected ? "#6c757d" : "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: (loading || connectionStatus?.connected) ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            {loading ? "⏳ Conectando..." : 
             connectionStatus?.connected ? "✅ Ya Conectado" : "🔗 Conectar Cuenta MP"}
          </button>
          <p style={{ fontSize: "14px", color: "#666", margin: "5px 0 0 0" }}>
            Conecta tu cuenta de Mercado Pago usando OAuth 2.0
          </p>
        </div>

        {/* Sincronizar movimientos */}
        <div>
          <button 
            onClick={syncMovements} 
            disabled={loading || !connectionStatus?.connected}
            style={{ 
              padding: "12px 24px", 
              backgroundColor: !connectionStatus?.connected ? "#6c757d" : "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: (loading || !connectionStatus?.connected) ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            {loading ? "⏳ Sincronizando..." : "🔄 Sincronizar Movimientos"}
          </button>
          <p style={{ fontSize: "14px", color: "#666", margin: "5px 0 0 0" }}>
            Importa tus últimos movimientos de Mercado Pago (últimos 30 días)
          </p>
        </div>
      </div>

      {/* Resultados de conexión directa */}
      {syncResult && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: syncResult.success ? "#d1ecf1" : "#f8d7da", 
          border: syncResult.success ? "1px solid #bee5eb" : "1px solid #f5c6cb",
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          <h4>{syncResult.success ? "✅ Conexión Directa Exitosa" : "❌ Error en Conexión Directa"}</h4>
          <p><strong>Mensaje:</strong> {syncResult.message}</p>
          {syncResult.data && (
            <details style={{ marginTop: "10px" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                🔍 Ver detalles de conexión
              </summary>
              <pre style={{ 
                whiteSpace: "pre-wrap", 
                fontSize: "12px", 
                backgroundColor: "white", 
                padding: "10px",
                borderRadius: "4px",
                maxHeight: "200px",
                overflowY: "auto"
              }}>
                {JSON.stringify(syncResult.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Resultados de error */}
      {error && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          border: "1px solid #f5c6cb",
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          <h4>❌ Error</h4>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px", margin: 0 }}>
            {error}
          </pre>
        </div>
      )}

      {/* Resultados de sincronización */}
      {result && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: result.success ? "#d1ecf1" : "#f8d7da", 
          border: result.success ? "1px solid #bee5eb" : "1px solid #f5c6cb",
          borderRadius: "8px"
        }}>
          <h4>{result.success ? "✅ Éxito" : "❌ Resultado"}</h4>
          
          {/* Información general */}
          <div style={{ marginBottom: "15px" }}>
            <p><strong>Mensaje:</strong> {result.message}</p>
            
            {result.data && (
              <>
                {result.data.imported !== undefined && (
                  <p><strong>Movimientos importados:</strong> {result.data.imported}</p>
                )}
                {result.data.lastSyncAt && (
                  <p><strong>Última sincronización:</strong> {new Date(result.data.lastSyncAt).toLocaleString()}</p>
                )}
              </>
            )}
          </div>

          {/* Lista de movimientos */}
          {result.data?.movements && result.data.movements.length > 0 && (
            <div>
              <h5>📋 Movimientos Importados:</h5>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {result.data.movements.slice(0, 10).map((movement, index) => (
                  <div key={index} style={{ 
                    padding: "10px", 
                    margin: "5px 0", 
                    backgroundColor: "white",
                    borderRadius: "4px",
                    borderLeft: `4px solid ${movement.type === "income" ? "#28a745" : "#dc3545"}`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>
                        {movement.type === "income" ? "💰 Ingreso" : "💳 Gasto"}: 
                        ${movement.amount}
                      </strong>
                      <span style={{ 
                        fontSize: "12px", 
                        backgroundColor: movement.type === "income" ? "#d4edda" : "#f8d7da",
                        color: movement.type === "income" ? "#155724" : "#721c24",
                        padding: "2px 8px",
                        borderRadius: "12px"
                      }}>
                        {movement.type}
                      </span>
                    </div>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      {movement.description}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      📅 {new Date(movement.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {result.data.movements.length > 10 && (
                  <p style={{ textAlign: "center", fontStyle: "italic", color: "#666" }}>
                    ... y {result.data.movements.length - 10} movimientos más
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Raw data para debug */}
          <details style={{ marginTop: "15px" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
              🔍 Ver datos completos (Debug)
            </summary>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              fontSize: "12px", 
              backgroundColor: "white", 
              padding: "10px",
              borderRadius: "4px",
              maxHeight: "300px",
              overflowY: "auto"
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Información adicional */}
      <div style={{ 
        padding: "15px", 
        backgroundColor: "#fff3cd", 
        borderRadius: "8px",
        marginTop: "20px"
      }}>
        <h4>💡 Información</h4>
        <p><strong>¿Qué hace este componente?</strong></p>
        <ul style={{ fontSize: "14px", color: "#856404", margin: "10px 0", paddingLeft: "20px" }}>
          <li>Conecta tu cuenta de Mercado Pago de forma segura usando OAuth 2.0</li>
          <li>Importa automáticamente tus movimientos de los últimos 30 días</li>
          <li>Los movimientos se categorizan como ingresos o gastos automáticamente</li>
          <li>Evita duplicados usando IDs únicos de Mercado Pago</li>
        </ul>
        <p style={{ fontSize: "12px", fontStyle: "italic", margin: "5px 0 0 0" }}>
          🔒 Tus credenciales nunca se almacenan directamente, se usan tokens seguros.
        </p>
      </div>
    </div>
  );
};

export default SyncMercadoPago;