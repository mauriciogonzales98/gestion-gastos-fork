import React, { useState } from "react";
import styles from "./OperationList.module.css";
import deleteOperation from "./OperationDeleteManager.jsx";
import { updateOperation } from "./operationUpdate/OperationUpdateManager.jsx";
import { useToken } from "../../Contexts/tokenContext/TokenContext.jsx";

const OperationList = ({ operations, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState();
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [selectedTypeValue, setSelectedTypeValue] = useState(null);
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
        if (onDelete) onDelete();
      } catch (err) {
        setIsDeleting(false);
      }
    }
    if (window.close) {
      setIsDeleting(false);
    }
  };

  const handleDoubleClick = (operation) => {
    setEditingId(operation.id);
    setEditedValues({
      description: operation.description || "",
      amount: operation.amount.toString(),
      category: operation.category?.name || "",
      date: operation.date.split("T")[0], // Format for date input
      type: operation.type,
    });
  };

  const handleInputChange = (field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (operationId) => {
    try {
      if (!token) {
        token = await refreshToken();
      }

      const updates = {
        description: editedValues.description,
        amount: parseFloat(editedValues.amount),
        date: editedValues.date,
        type: editedValues.type,
        // Si vamos a poner el objeto de category podríamos tener que manejarlo distinto
      };

      await updateOperation(operationId, updates, token);
      setEditingId(null);
      setEditedValues({});

      //Refrescar la lista
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error updating operation:", error);
      alert("Error al actualizar la operación");
    }
  };

  const handleBlur = (operationId) => {
    // Optional: Save on blur or require explicit Enter
    // handleSave(operationId);
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
              <div className={styles.editForm}>
                <input
                  type="text"
                  value={editedValues.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  // onKeyUp={(e) => handleKeyPress(e, operation.id)}
                  onBlur={() => handleBlur(operation.id)}
                  className={styles.editInput}
                  placeholder="Descripción"
                  maxLength="100"
                  autoFocus
                />
                <input
                  type="number"
                  value={editedValues.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  //onKeyUp={(e) => handleKeyPress(e, operation.id)}
                  onBlur={() => handleBlur(operation.id)}
                  className={styles.editInput}
                  step="1"
                />
                <input
                  type="date"
                  value={editedValues.date}
                  min="1900-01-01"
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  //onKeyUp={(e) => handleKeyPress(e, operation.id)}
                  onBlur={() => handleBlur(operation.id)}
                  className={styles.editInput}
                />
                {/* Radio para seleccionar tipo de operación  */}
                <div>
                  <label>
                    <input
                      type="radio"
                      name="gasto"
                      checked={selectedTypeValue === "gasto"}
                      onChange={(e) => {
                        handleInputChange("type", "gasto");
                        setSelectedTypeValue("gasto");
                      }}
                    />{" "}
                    Gasto
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="ingreso"
                      checked={selectedTypeValue === "ingreso"}
                      onChange={(e) => {
                        handleInputChange("type", "ingreso");
                        setSelectedTypeValue("ingreso");
                      }}
                    />{" "}
                    Ingreso
                  </label>
                </div>
                <div className={styles.editActions}>
                  <button
                    onClick={() => handleSave(operation.id)}
                    className={styles.saveButton}
                  >
                    ✅
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditedValues({});
                    }}
                    className={styles.cancelButton}
                  >
                    ❌
                  </button>
                </div>
              </div>
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
