import React, { useState, useEffect } from "react";
import CategoryIcon from "../CategoryForm/CategoryIcon";
import CategoryList from "../CategoryForm/CategoryList";
import CategoryButtons from "../CategoryForm/CategoryButtons";

const OperationForm = ({ walletId, token }) => {
  const [operationType, setOperationType] = useState("gasto");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('http://localhost:3001/api/category/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletId) {
      setMessage("⚠️ Por favor selecciona una wallet primero");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setMessage("⚠️ Ingresa un monto válido");
      return;
    }

    setLoading(true);
    setMessage("");

    const operationData = {
      amount: parseFloat(amount),
      type: operationType,
      description,
      walletid: walletId,
      categoryid: parseInt(selectedCategoryId) || null,
      date: new Date().toISOString()
    };
    console.log('Submitting operation:', operationData);
    try {
      const response = await fetch('http://localhost:3001/api/operation/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(operationData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage("✅ Operación registrada correctamente");
        setAmount("");
        setDescription("");
        setSelectedCategoryId("");
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Error: ${errorData.message || 'Error al crear la operación'}`);
      }
    } catch (error) {
      console.error('Error creating operation:', error);
      setMessage("❌ Error de conexión al crear la operación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '25px', 
      background: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      height: 'fit-content',
      textAlign: 'left'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Registrar Operación</h2>
      
      {message && (
        <div style={{ 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '15px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {!walletId ? (
        <div style={{ 
          padding: '20px', 
          background: '#fff3cd', 
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#856404' }}>
            ⚠️ Selecciona una wallet para registrar operaciones
          </p>
        </div>
      ) : (
        <div style={{ 
          padding: '12px', 
          background: '#d1edff', 
          borderRadius: '6px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#0c5460', fontWeight: 'bold' }}>
            ✅ Listo para registrar operaciones
          </p>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '15px', fontWeight: 'bold', color: '#555' }}>Tipo de Operación:</label>
        <button 
          type="button"
          onClick={() => setOperationType("gasto")}
          style={{ 
            backgroundColor: operationType === "gasto" ? "#dc3545" : "#6c757d",
            color: "white",
            border: "none",
            padding: "10px 20px",
            marginRight: "10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: 'all 0.3s ease'
          }}
        >
          💸 Gasto
        </button>
        <button 
          type="button"
          onClick={() => setOperationType("ingreso")}
          style={{ 
            backgroundColor: operationType === "ingreso" ? "#28a745" : "#6c757d",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: 'all 0.3s ease'
          }}
        >
          💰 Ingreso
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            Monto:
          </label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required 
            disabled={!walletId || loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '6px',
              fontSize: '16px',
              transition: 'border-color 0.3s ease'
            }}
            step="0.01"
            min="0.01"
            placeholder="0.00"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            Descripción:
          </label>
          <input 
            type="text" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!walletId || loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '6px',
              fontSize: '16px',
              transition: 'border-color 0.3s ease'
            }}
            placeholder="Descripción de la operación"
            maxLength="100"
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>
      Categoría (opcional):
    </label>

    <CategoryButtons
      categories={categories}
      selectedId={selectedCategoryId}
      onSelect={setSelectedCategoryId}
    />
  </div>

        <button 
          type="submit" 
          disabled={!walletId || loading || !amount}
          style={{
            backgroundColor: !walletId || loading ? '#6c757d' : (operationType === "gasto" ? "#dc3545" : "#28a745"),
            color: "white",
            border: "none",
            padding: "14px 30px",
            borderRadius: "6px",
            cursor: !walletId || loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            width: '100%',
            transition: 'all 0.3s ease',
            opacity: !walletId || loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Procesando...' : 
           walletId ? 
             `📝 Registrar ${operationType === "gasto" ? "Gasto" : "Ingreso"}` : 
             'Selecciona una wallet'
          }
        </button>
      </form>
    </div>
  );
};

export default OperationForm;