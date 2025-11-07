import { useToken } from "../../../Contexts/fbTokenContext/TokenContext";
import { useEffect, useState } from "react";
import WalletLoading from "../../Wallet/WalletLoading";
import CategoryButtons from "../../Category/CategoryForm/CategoryButtons";
import TagSelector from "../../Tag/TagSelector"; // Importar el mismo TagSelector
import styles from "./OperationUpdateManager.module.css";

const OperationUpdateForm = ({
  editingId,
  setEditingId,
  editedValues,
  setEditedValues,
  onChange,
  operationData
}) => {
  const [selectedTypeValue, setSelectedTypeValue] = useState(null);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedTagId, setSelectedTagId] = useState(null); // Estado para tag
  const { token, refreshToken } = useToken();

  useEffect(() => {
    const loadCategories = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:3001/api/category/", {
          method: "GET",
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

  // Inicializar valores cuando se empieza a editar
  useEffect(() => {
    if (editingId && operationData) {
      const operationToEdit = operationData.find(op => op.id === editingId);
      if (operationToEdit) {
        setSelectedCategoryId(operationToEdit.category?.id || "");
        setSelectedTagId(operationToEdit.tagid?.id || null); // Inicializar tag
        setSelectedWalletId(operationToEdit.wallet?.id || null);
        
        // También inicializar los editedValues si es necesario
        setEditedValues({
          description: operationToEdit.description || "",
          amount: operationToEdit.amount || "",
          date: operationToEdit.date ? operationToEdit.date.split('T')[0] : "",
          type: operationToEdit.type || "gasto",
        });
      }
    }
  }, [editingId, operationData, setEditedValues]);

  // Maneja el guardado de las operaciones
  const handleSave = async (operationId) => {
    try {
      let currentToken = token;
      if (!currentToken) {
        currentToken = await refreshToken();
      }

      const updates = {
        description: editedValues.description,
        amount: parseFloat(editedValues.amount),
        date: editedValues.date,
        type: editedValues.type,
        categoryid: selectedCategoryId || null,
        tagid: selectedTagId === -1 ? null : selectedTagId, // Manejar "sin etiqueta"
        walletid: selectedWalletId,
      };
      
      console.log("💾 Guardando updates:", updates);

      await updateOperation(operationId, updates, currentToken);
      setEditingId(null);
      setEditedValues({});
      setSelectedCategoryId("");
      setSelectedTagId(null);
      setSelectedWalletId(null);

      if (onChange) onChange();
    } catch (error) {
      console.error("Error updating operation:", error);
      alert("Error al actualizar la operación");
    }
  };

  // Maneja el input de los datos
  const handleInputChange = (field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Maneja el cambio de Wallet
  const handleWalletChange = (walletId) => {
    setSelectedWalletId(walletId);
    setEditedValues((prev) => ({
      ...prev,
      walletid: walletId,
    }));
  };

  // Maneja el cambio de Category
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setEditedValues((prev) => ({
      ...prev,
      categoryid: categoryId,
    }));
  };

  // Maneja el cambio de Tag
  const handleTagChange = (tagId) => {
    setSelectedTagId(tagId);
    setEditedValues((prev) => ({
      ...prev,
      tagid: tagId,
    }));
  };

  return (
    <div className={styles.editForm}>
      <h4>✏️ Editando Operación</h4>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Descripción:</label>
        <input
          type="text"
          value={editedValues.description || ""}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className={styles.editInput}
          placeholder="Descripción"
          maxLength="100"
          autoFocus
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Monto:</label>
        <input
          type="number"
          value={editedValues.amount || ""}
          onChange={(e) => handleInputChange("amount", e.target.value)}
          className={styles.editInput}
          step="0.01"
          placeholder="0.00"
        />
      </div>

      {/* ✅ Date Picker para edición */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Fecha:</label>
        <input
          type="date"
          value={editedValues.date || ""}
          min="1900-01-01"
          onKeyDown={(e) => e.preventDefault()}
          onChange={(e) => handleInputChange("date", e.target.value)}
          className={styles.editInput}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Tipo:</label>
        <div className={styles.typeSelector}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="type"
              value="gasto"
              checked={editedValues.type === "gasto"}
              onChange={(e) => {
                handleInputChange("type", "gasto");
                setSelectedTypeValue("gasto")
              }}
            />{" "}
            💸 Gasto
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="type"
              value="ingreso"
              checked={editedValues.type === "ingreso"}
              onChange={(e) =>{
                handleInputChange("type", "ingreso");
                setSelectedTypeValue("ingreso");
              }} 
            />{" "}
            💰 Ingreso
          </label>
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Wallet:</label>
        <div className={styles.walletContainer}>
          <WalletLoading
            token={token}
            selectedWalletId={selectedWalletId}
            setSelectedWalletId={handleWalletChange}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Categoría:</label>
        <div className={styles.categoryButtonsContainer}>
          <CategoryButtons
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={handleCategoryChange}
          />
        </div>
      </div>

      {/* ✅ Selector de Tags (igual que en OperationForm) */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Etiqueta:</label>
        <div className={styles.tagSelectorContainer}>
          <TagSelector 
            selectedTagId={selectedTagId}
            onTagSelect={handleTagChange}
            token={token}
          />
        </div>
      </div>

      {/* Botones para aceptar y cancelar */}
      <div className={styles.editActions}>
        <button
          onClick={() => handleSave(editingId)}
          className={styles.saveButton}
        >
          ✅ Guardar
        </button>

        <button
          onClick={() => {
            setEditingId(null);
            setEditedValues({});
            setSelectedCategoryId("");
            setSelectedTagId(null);
            setSelectedWalletId(null);
          }}
          className={styles.cancelButton}
        >
          ❌ Cancelar
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