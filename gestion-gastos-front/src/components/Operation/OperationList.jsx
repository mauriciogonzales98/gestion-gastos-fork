import React, { useState } from "react";
import styles from "./OperationList.module.css";
import deleteOperation from "./OperationDeleteManager.jsx";
import { useToken } from "../../Contexts/tokenContext/TokenContext.jsx";

const OperationList = ({ operations, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState();
  const { token, loadingToken, refreshToken } = useToken();

  if (!Array.isArray(operations) || operations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.emptyTitle}>Lista de Operaciones</h2>
        <p className={styles.emptyText}>No hay operaciones para mostrar</p>
      </div>
    );
  }

  const handleDelete = async (operation, token) => {
    if (!token) {
      try {
        token = await refreshToken();
      } catch (error) {
        console.log("Error refreshing token: ", error);
      }
    }
    const amount = Number(operation.amount);
    setIsDeleting(true);
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar la operación "${
          operation.description
        }" por $${amount.toFixed(2)}?`
      )
    ) {
      //DEBUG
      console.log("id de la operación a eliminar", operation.id);
      try {
        await deleteOperation(operation.id, token);
        setIsDeleting(false);
        if (onDelete) onDelete();
      } catch (err) {
        console.log("error eliminando operación", err);
        setIsDeleting(false);
      }
    }
    if (window.close) {
      setIsDeleting(false);
    }
  };

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
              operation.type === "gasto" ? styles.expense : ""
            }`}
          >
            <div className={styles.operationContent}>
              <div className={styles.operationDescription}>
                {operation.description || "Sin descripción"}
              </div>
              <div className={styles.operationDetails}>
                <span
                  className={`${styles.operationAmount} ${
                    operation.type === "gasto" ? styles.expense : ""
                  }`}
                >
                  ${operation.amount}
                </span>
                {operation.category && (
                  <span className={styles.operationCategory}>
                    📁 {operation.category.name}
                  </span>
                )}
                <span className={styles.operationDate}>
                  📅 {new Date(operation.date).toLocaleDateString("es-ES")}
                </span>
                <span
                  className={`${styles.operationType} ${
                    operation.type === "gasto" ? styles.expense : ""
                  }`}
                >
                  {operation.type === "ingreso" ? "INGRESO" : "GASTO"}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                handleDelete(operation, token);
              }}
              disabled={isDeleting}
              className={styles.deleteButton}
            >
              {isDeleting ? "⏳ Eliminando..." : "🗑️ Eliminar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OperationList;
