import React, { useState, useEffect } from "react";
import CategoryButtons from "../../Category/CategoryForm/CategoryButtons";
import styles from "./OperationForm.module.css";

const OperationForm = ({ walletId, token, onOperationAdded }) => {
  const [operationType, setOperationType] = useState("gasto");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // useEffect(() => {
  //   const loadCategories = async () => {
  //     if (!token) return;

  //     try {
  //       const response = await fetch("http://localhost:3001/api/category/", {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       const data = await response.json();
  //       if (data.success) {
  //         setCategories(data.data);
  //       }
  //     } catch (error) {
  //       console.error("Error loading categories:", error);
  //     }
  //   };

  //   loadCategories();
  // }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletId) {
      setMessage("Por favor selecciona una wallet primero");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setMessage("Ingresa un monto válido");
      return;
    }

    if (amount > 9999999999.99) {
      setMessage("El monto no puede ser mayor a 999,999,999.99");
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
      date: new Date().toISOString(),
    };

    console.log("Submitting operation:", operationData);

    try {
      const response = await fetch("http://localhost:3001/api/operation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(operationData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage("✅ Operación registrada correctamente");
        setAmount("");
        setDescription("");
        setSelectedCategoryId("");

        if (onOperationAdded) {
          onOperationAdded();
        }

        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await response.json();
        setMessage(
          `❌ Error: ${errorData.message || "Error al crear la operación"}`
        );
      }
    } catch (error) {
      console.error("Error creating operation:", error);
      setMessage("❌ Error de conexión al crear la operación");
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyle = () => {
    return message.includes("✅") ? styles.messageSuccess : styles.messageError;
  };

  const getSubmitButtonStyle = () => {
    if (!walletId || loading) return "";
    return operationType === "gasto"
      ? styles.submitButtonExpense
      : styles.submitButtonIncome;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Registrar Operación</h2>

      {message && (
        <div className={`${styles.message} ${getMessageStyle()}`}>
          {message}
        </div>
      )}

      {!walletId ? (
        <div className={styles.walletAlert}>
          <p className={styles.walletAlertText}>
            ⚠️ Selecciona una wallet para registrar operaciones
          </p>
        </div>
      ) : (
        <div className={styles.walletReady}>
          <p className={styles.walletReadyText}>
            ✅ Listo para registrar operaciones
          </p>
        </div>
      )}

      <div className={styles.typeSelector}>
        <span className={styles.typeLabel}>Tipo de Operación:</span>
        <button
          type="button"
          onClick={() => setOperationType("gasto")}
          className={`${styles.typeButton} ${
            operationType === "gasto"
              ? styles.typeButtonExpense
              : styles.typeButtonActive
          }`}
        >
          💸 Gasto
        </button>
        <button
          type="button"
          onClick={() => setOperationType("ingreso")}
          className={`${styles.typeButton} ${
            operationType === "ingreso"
              ? styles.typeButtonIncome
              : styles.typeButtonActive
          }`}
        >
          💰 Ingreso
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Descripción:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!walletId || loading}
            className={styles.input}
            placeholder="Descripción de la operación"
            maxLength="100"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Monto:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={!walletId || loading}
            className={styles.input}
            step="0.01"
            min="0.01"
            max="9999999999.99"
            placeholder="0.00"
          />
        </div>

        <div className={styles.categorySection}>
          <label className={styles.label}>Categoría (opcional):</label>
          <CategoryButtons
            // categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </div>

        <button
          type="submit"
          disabled={!walletId || loading || !amount}
          className={`${styles.submitButton} ${getSubmitButtonStyle()}`}
        >
          {loading
            ? "⏳ Procesando..."
            : walletId
            ? `📝 Registrar ${operationType === "gasto" ? "Gasto" : "Ingreso"}`
            : "Selecciona una wallet"}
        </button>
      </form>
    </div>
  );
};

export default OperationForm;
