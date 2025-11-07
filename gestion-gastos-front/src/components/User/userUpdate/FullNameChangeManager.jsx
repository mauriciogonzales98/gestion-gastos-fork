import { useState } from "react";
import { useToken } from "../../../Contexts/fbTokenContext/TokenContext";
import styles from "./FullNameChangeManager.module.css";

const FullNameChange = ({ onCancel, userId }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const { token } = useToken();
  const [editedValues, setEditedValues] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsChanging(true);
    setErrorMessage("");

    // MODIFICADO: Permitir cambiar solo uno de los campos
    if (!editedValues.name && !editedValues.surname) {
      setErrorMessage("Debes modificar al menos uno de los campos");
      setIsChanging(false);
      return;
    }

    // MODIFICADO: Solo enviar los campos que fueron modificados
    const updates = {};
    if (editedValues.name) updates.name = editedValues.name;
    if (editedValues.surname) updates.surname = editedValues.surname;

    try {
      await updateFullName(userId, updates, token);
      setShowSuccess(true);
      
      setTimeout(() => {
        onCancel();
      }, 2000);
      
    } catch (error) {
      console.error("Error guardando cambios:", error);
    } finally {
      setIsChanging(false);
    }
  };

  const updateFullName = async (userId, updates, token) => {
    try {
      const response = await fetch(`http://localhost:3001/api/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar el nombre");
      }
    } catch (err) {
      console.error("FE: Error cambiando nombre completo:", err);
      setErrorMessage("Error cambiando nombre. Inténtalo de nuevo.");
      throw err;
    }
  };

  if (showSuccess) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successMessage}>
          ✅ ¡Nombre y apellido actualizados exitosamente!
        </div>
        <div className={styles.successSubtitle}>
          El formulario se cerrará automáticamente...
        </div>
      </div>
    );
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nuevo Nombre:</label>
          <input
            type="text"
            id="newName"
            name="newName"
            className={styles.input}
            maxLength="50"
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={isChanging}
            placeholder="Dejar vacío para no modificar" // NUEVO: placeholder informativo
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Nuevo Apellido:</label>
          <input
            type="text"
            id="newSurname"
            name="newSurname"
            className={styles.input}
            onChange={(e) => handleInputChange("surname", e.target.value)}
            maxLength="50"
            disabled={isChanging}
            placeholder="Dejar vacío para no modificar" // NUEVO: placeholder informativo
          />
        </div>

        {errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
            // MODIFICADO: Solo deshabilitar si no hay ningún campo modificado
            disabled={isChanging || (!editedValues.name && !editedValues.surname)}
          >
            {isChanging ? "Guardando..." : "Guardar Cambios"}
          </button>
          
          <button 
            type="button" 
            onClick={onCancel} 
            className={styles.cancelButton}
            disabled={isChanging}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FullNameChange;