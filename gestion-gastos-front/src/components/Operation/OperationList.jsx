import React from "react";
import styles from "./OperationList.module.css";

const OperationList = ({ operations, onDelete, deletingId }) => {
  if (!Array.isArray(operations) || operations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.emptyTitle}>Lista de Operaciones</h2>
        <p className={styles.emptyText}>No hay operaciones para mostrar</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Lista de Operaciones ({operations.length})
      </h2>
      <ul className={styles.list}>
        {operations.map((operation) => (
          <li 
            key={operation.id} 
            className={`${styles.operationItem} ${
              operation.type === 'gasto' ? styles.expense : ''
            }`}
          >
            <div className={styles.operationContent}>
              <div className={styles.operationDescription}>
                {operation.description || 'Sin descripción'}
              </div>
              <div className={styles.operationDetails}>
                <span className={`${styles.operationAmount} ${
                  operation.type === 'gasto' ? styles.expense : ''
                }`}>
                  ${operation.amount}
                </span>
                {operation.category && (
                  <span className={styles.operationCategory}>
                    📁 {operation.category.name}
                  </span>
                )}
                <span className={styles.operationDate}>
                  📅 {new Date(operation.date).toLocaleDateString('es-ES')}
                </span>
                <span className={`${styles.operationType} ${
                  operation.type === 'gasto' ? styles.expense : ''
                }`}>
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
              className={styles.deleteButton}
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