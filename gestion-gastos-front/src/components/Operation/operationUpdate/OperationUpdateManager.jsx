import { useToken } from "../../../Contexts/fbTokenContext/TokenContext";
import styles from "../OperationList.module.css";
import { useEffect, useState } from "react";
import WalletLoading from "../../Wallet/WalletLoading";

import CategoryList from "../../Category/CategoryForm/CategoryList";
import CategoryButtons from "../../Category/CategoryForm/CategoryButtons";

const OperationUpdateForm = ({
  editingId,
  setEditingId,
  editedValues,
  setEditedValues,
  onChange,
}) => {
  const [selectedTypeValue, setSelectedTypeValue] = useState(null);
  const [categories, setCategories] = useState(null);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const { token, refreshToken } = useToken();
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
        categoryid: editedValues.categoryid,
        walletid: editedValues.walletid,
        // Si vamos a poner el objeto de category podríamos tener que manejarlo distinto
      };
      //DEBUG
      console.log("Updates: ", updates);

      await updateOperation(operationId, updates, token);
      setEditingId(null);
      setEditedValues({});

      //Refrescar la lista
      if (onChange) onChange();
    } catch (error) {
      console.error("Error updating operation:", error);
      alert("Error al actualizar la operación");
    }
  };
  const handleInputChange = (field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleWalletChange = (walletId) => {
    setSelectedWalletId(walletId);
    setEditedValues((prev) => ({
      ...prev,
      walletid: walletId,
    }));
  };
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setEditedValues((prev) => ({
      ...prev,
      categoryid: categoryId,
    }));
  };
  useEffect(() => {
    const loadCategories = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:3001/api/category/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, [token]);

  return (
    // Modo edición
    <div className={styles.editForm}>
      <input
        type="text"
        value={editedValues.description}
        onChange={(e) => handleInputChange("description", e.target.value)}
        // onKeyUp={(e) => handleKeyPress(e, operation.id)}
        //onBlur={() => handleBlur(operation.id)}
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
        //onBlur={() => handleBlur(operation.id)}
        className={styles.editInput}
        step="1"
      />
      <input
        type="date"
        value={editedValues.date}
        min="1900-01-01"
        onChange={(e) => handleInputChange("date", e.target.value)}
        //onKeyUp={(e) => handleKeyPress(e, operation.id)}
        //onBlur={() => handleBlur(operation.id)}
        className={styles.editInput}
      />
      {/* Radio para seleccionar tipo de operación  */}
      <div>
        <label>
          <input
            type="radio"
            name="gasto"
            checked={
              selectedTypeValue === "gasto" || editedValues.type == "gasto"
            }
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
            checked={
              selectedTypeValue === "ingreso" || editedValues.type == "ingreso"
            }
            onChange={(e) => {
              handleInputChange("type", "ingreso");
              setSelectedTypeValue("ingreso");
            }}
          />{" "}
          Ingreso
        </label>
      </div>
      {/*Selección de wallet*/}
      <div>
        <WalletLoading
          token={token}
          selectedWalletId={selectedWalletId}
          setSelectedWalletId={handleWalletChange}
        />
        {/*Selección de categoría*/}
      </div>
      <CategoryButtons
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={handleCategoryChange}
      />
      <div></div>
      {/*Botones para aceptar y cancelar*/}

      <div className={styles.editActions}>
        <button
          onClick={() => {
            console.log("editedValues: ", editedValues);
            handleSave(editingId);
          }}
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
  );
};

export const updateOperation = async (operationId, updates, token) => {
  const response = await fetch(
    `http://localhost:3001/api/operation/${operationId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update operation");
  }

  return await response.json();
};

export default OperationUpdateForm;
