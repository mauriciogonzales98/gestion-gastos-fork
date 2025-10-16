import React from "react";

const OperationList = ({ operations, onDelete, deletingId }) => {
  if (!Array.isArray(operations) || operations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ color: '#666', marginBottom: '15px' }}>Lista de Operaciones</h2>
        <p style={{ color: '#999', fontSize: '16px' }}>No hay operaciones para mostrar</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Lista de Operaciones ({operations.length})
      </h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {operations.map((operation) => (
          <li 
            key={operation.id} 
            style={{
              padding: '15px 20px',
              margin: '10px 0',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: `5px solid ${operation.type === 'ingreso' ? '#28a745' : '#dc3545'}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                {operation.description || 'Sin descripción'}
              </div>
              <div style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                <span style={{ 
                  color: operation.type === 'ingreso' ? '#28a745' : '#dc3545',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  ${operation.amount}
                </span>
                {operation.category && (
                  <span style={{ marginLeft: '15px' }}>
                    📁 {operation.category.name}
                  </span>
                )}
                <span style={{ marginLeft: '15px' }}>
                  📅 {new Date(operation.date).toLocaleDateString('es-ES')}
                </span>
                <span style={{ 
                  marginLeft: '15px',
                  padding: '3px 10px',
                  backgroundColor: operation.type === 'ingreso' ? '#d4edda' : '#f8d7da',
                  color: operation.type === 'ingreso' ? '#155724' : '#721c24',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {operation.type === 'ingreso' ? 'INGRESO' : 'GASTO'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm(`¿Estás seguro de que quieres eliminar la operación "${operation.description}" por $${operation.amount.toFixed(2)}?`)) {
                  onDelete(operation.id);
                }
              }}
              disabled={deletingId === operation.id}
              style={{
                padding: '8px 15px',
                backgroundColor: deletingId === operation.id ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: deletingId === operation.id ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s, transform 0.2s',
                opacity: deletingId === operation.id ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (deletingId !== operation.id) {
                  e.target.style.backgroundColor = '#c82333';
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseOut={(e) => {
                if (deletingId !== operation.id) {
                  e.target.style.backgroundColor = '#dc3545';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {deletingId === operation.id ? '⏳ Eliminando...' : '🗑️ Eliminar'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OperationList;