import React, { useState } from "react";
import styles from "./OperationList.module.css";
import deleteOperation from "./OperationDeleteManager.jsx";
import OperationUpdateForm, {
  updateOperation,
} from "./operationUpdate/OperationUpdateManager.jsx";
import { useToken } from "../../Contexts/tokenContext/TokenContext.jsx";
import WalletSelector from "../Wallet/WalletSelector.jsx";

const OperationList = ({ operations, onChange }) => {
  const [isDeleting, setIsDeleting] = useState();
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const { token, refreshToken } = useToken();
  if (operations > 0) {
    console.log("Operations[0]: ", operations[0]);
    console.log("Datos:");
    console.log(operations[0].id);
    console.log(operations[0].category);
    console.log(operations[0].description);
  }
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
      } catch (error) {}
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
      try {
        await deleteOperation(operation.id, token);
        setIsDeleting(false);
        if (onChange) onChange();
      } catch (err) {
        setIsDeleting(false);
      }
    }
    if (window.close) {
      setIsDeleting(false);
    }
  };
  // Inicia el modo de edición, llamando al componente OperationUpdateForm
  const handleDoubleClick = (operation) => {
    setEditingId(operation.id);
    setEditedValues({
      description: operation.description || "",
      amount: operation.amount.toString(),
      category: operation.category?.id || null,
      date: operation.date.split("T")[0], // Format for date input
      type: operation.type,
      walletid: operation.wallet,
    });
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
            } ${editingId === operation.id ? styles.editing : ""}`}
            onDoubleClick={() => handleDoubleClick(operation)}
          >
            {editingId === operation.id ? (
              // Modo edición
              <OperationUpdateForm
                editingId={editingId}
                setEditingId={setEditingId}
                editedValues={editedValues}
                setEditedValues={setEditedValues}
                onChange={onChange}
              />
            ) : (
              // Modo display
              <>
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
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OperationList;
