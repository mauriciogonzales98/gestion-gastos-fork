import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const MercadoPagoTest = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  // Obtener token - igual que en CategoryForm
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      user.getIdToken().then((t) => {
        setToken(t);
        setDebugInfo("✅ Token cargado desde Firebase");
      }).catch(err => {
        setDebugInfo("❌ Error obteniendo token: " + err.message);
      });
    } else {
      setDebugInfo("❌ No hay usuario autenticado");
    }
  }, []);

  // Probar conexión con Mercado Pago
  const testConnection = useCallback(async () => {
    if (!token) {
      setError("No hay token. Por favor, inicia sesión primero.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      setDebugInfo("🔍 Enviando request de prueba...");
      
      const response = await fetch(`${API_BASE}/api/mercado-pago/test`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setDebugInfo("✅ Conexión exitosa con el backend");
      
    } catch (err) {
      const errorMessage = err.message || "Error de conexión";
      setError(errorMessage);
      setDebugInfo(`❌ Error: ${errorMessage}`);
      console.error("Error en prueba:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Importar movimientos
  const importMovements = useCallback(async () => {
    if (!token) {
      setError("No hay token. Por favor, inicia sesión primero.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Por favor selecciona ambas fechas");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      setDebugInfo(`📅 Importando movimientos desde ${startDate} hasta ${endDate}...`);
      
      const response = await fetch(`${API_BASE}/api/mercado-pago/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setDebugInfo(`✅ Importación completada. ${data.summary?.total || 0} movimientos encontrados.`);
      
    } catch (err) {
      const errorMessage = err.message || "Error al importar";
      setError(errorMessage);
      setDebugInfo(`❌ Error en importación: ${errorMessage}`);
      console.error("Error en importación:", err);
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate]);

  // Limpiar resultados
  const clearResults = () => {
    setResult(null);
    setError("");
    setDebugInfo(token ? "✅ Token listo para usar" : "❌ No hay token");
  };

  // Si no hay token, mostrar mensaje
  if (!token) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>🧪 Prueba de Integración - Mercado Pago</h2>
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
        🧪 Prueba de Integración - Mercado Pago
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
          Limpiar Resultados
        </button>
      </div>

      {/* Sección de Pruebas */}
      <div style={{ 
        padding: "15px", 
        backgroundColor: "#e7f3ff", 
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <h3>🔌 Pruebas de Conexión</h3>
        
        {/* Prueba de conexión simple */}
        <div style={{ marginBottom: "15px" }}>
          <button 
            onClick={testConnection} 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px"
            }}
          >
            {loading ? "⏳ Probando..." : "🧪 Probar Conexión Backend"}
          </button>
          <p style={{ fontSize: "14px", color: "#666", margin: "5px 0 0 0" }}>
            Verifica la conexión con el backend y Mercado Pago
          </p>
        </div>

        {/* Importación por fechas */}
        <div>
          <h4>📥 Importar Movimientos</h4>
          <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap", marginBottom: "10px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Fecha Inicio:</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ 
                  padding: "8px", 
                  border: "1px solid #ddd", 
                  borderRadius: "4px",
                  minWidth: "150px"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Fecha Fin:</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ 
                  padding: "8px", 
                  border: "1px solid #ddd", 
                  borderRadius: "4px",
                  minWidth: "150px"
                }}
              />
            </div>
            <button 
              onClick={importMovements} 
              disabled={loading || !startDate || !endDate}
              style={{ 
                padding: "10px 20px", 
                backgroundColor: "#28a745", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: (loading || !startDate || !endDate) ? "not-allowed" : "pointer",
                fontSize: "16px",
                alignSelf: "flex-end"
              }}
            >
              {loading ? "⏳ Importando..." : "📥 Importar Movimientos"}
            </button>
          </div>
          <p style={{ fontSize: "14px", color: "#666", margin: "5px 0 0 0" }}>
            Importa movimientos de Mercado Pago dentro del rango de fechas seleccionado
          </p>
        </div>
      </div>

      {/* Resultados */}
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

      {result && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#d1ecf1", 
          border: "1px solid #bee5eb",
          borderRadius: "8px"
        }}>
          <h4>✅ Resultado</h4>
          
          {/* Información general */}
          <div style={{ marginBottom: "15px" }}>
            <strong>Estado:</strong> {result.success ? "✅ Éxito" : "❌ Fallo"}<br />
            <strong>Conexión:</strong> {result.connection || "N/A"}<br />
            {result.summary && (
              <>
                <strong>Total Movimientos:</strong> {result.summary.total}<br />
                <strong>Ingresos:</strong> {result.summary.incomes}<br />
                <strong>Gastos:</strong> {result.summary.expenses}
              </>
            )}
          </div>

          {/* Datos detallados */}
          {result.data && result.data.length > 0 && (
            <div>
              <h5>📋 Movimientos Encontrados:</h5>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {result.data.slice(0, 20).map((movement, index) => (
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
                      📅 {new Date(movement.date).toLocaleDateString()} | 
                      🏷️ {movement.category} | 
                      💳 {movement.paymentMethod}
                    </div>
                  </div>
                ))}
                {result.data.length > 20 && (
                  <p style={{ textAlign: "center", fontStyle: "italic", color: "#666" }}>
                    ... y {result.data.length - 20} movimientos más
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
    </div>
  );
};

export default MercadoPagoTest;