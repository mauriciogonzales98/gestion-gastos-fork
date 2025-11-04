import React, { useEffect, useState } from "react";
import styles from "./TagCreateModal.module.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const TagCreateModal = ({ isOpen, onClose, onCreate, token, onUpdate, tag, onDelete }) => {
  if (!isOpen) return null;
  
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6c757d");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [existingTags, setExistingTags] = useState([]); // ✅ NUEVO: Para validación frontend

  const defaultColors = [
    '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', 
    '#17a2b8', '#007bff', '#6f42c1', '#e83e8c', '#6c757d'
  ];

  useEffect(() => {
    if (isOpen && token) {
      // ✅ Cargar tags existentes cuando se abre el modal
      fetchExistingTags();
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (tag && isOpen) {
      setName(tag.name || "");
      setColor(tag.color || "#6c757d");
    } else if (isOpen) {
      setName("");
      setColor("#6c757d");
    }
    setShowDeleteConfirm(false);
    setError(""); // ✅ Limpiar errores al abrir/cerrar
  }, [tag, isOpen]);

  // ✅ NUEVO: Función para cargar tags existentes
  const fetchExistingTags = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tag/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setExistingTags(data.data);
      }
    } catch (error) {
      console.error("Error loading existing tags:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ VALIDACIÓN FRONTEND: Nombre requerido
    if (!name.trim()) {
      setError("Nombre requerido");
      return;
    }

    // ✅ VALIDACIÓN FRONTEND: Longitud máxima
    if (name.trim().length > 50) {
      setError("El nombre no puede tener más de 50 caracteres");
      return;
    }

    // ✅ VALIDACIÓN FRONTEND: Verificar nombre duplicado
    const normalizedNewName = name.trim().toLowerCase();
    const isNameDuplicate = existingTags.some(existingTag => {
      const normalizedExistingName = existingTag.name.toLowerCase();
      // En modo edición, excluir el tag actual
      if (tag && existingTag.id === tag.id) {
        return false;
      }
      return normalizedExistingName === normalizedNewName;
    });

    if (isNameDuplicate) {
      setError("Ya existe un tag con ese nombre");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const tagData = {
        name: name.trim(),
        color: color,
      };

      let res;
      if (tag) {
        res = await fetch(`${API_BASE}/api/tag/${tag.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(tagData),
        });
      } else {
        res = await fetch(`${API_BASE}/api/tag/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(tagData),
        });
      }

      const json = await res.json();
      
      if (res.ok && (json.success === undefined || json.success === true)) {
        const resultado = json.data || json;
        
        if (tag) {
          onUpdate(resultado);
        } else {
          onCreate(resultado);
        }
        handleClose();
      } else {
        // ✅ El backend también validará, así que mostramos su mensaje de error
        setError(json.message || `Error al ${tag ? 'actualizar' : 'crear'} tag`);
      }
    } catch (err) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setColor("#6c757d");
    setError("");
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!tag) return;
    
    setDeleteLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/tag/${tag.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (res.status === 204 || res.ok) {
        if (onDelete) {
          onDelete(tag.id);
        } else {
          window.location.reload();
        }
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      let errorMessage = `Error al eliminar (status ${res.status})`;
      
      try {
        if (contentType.includes("application/json")) {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const text = await res.text();
          errorMessage = text || errorMessage;
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      
      throw new Error(errorMessage);
      
    } catch (err) {
      console.error("Error eliminando tag:", err);
      setError(err.message || "Error al eliminar tag");
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const isEditMode = !!tag;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3>
          {isEditMode ? 'Editar tag' : 'Crear nuevo tag'}
        </h3>

        {showDeleteConfirm && (
          <div className={styles.deleteOverlay}>
            <div className={styles.deleteModal}>
              <h4>Confirmar eliminación</h4>
              <p>¿Estás seguro de que quieres eliminar el tag "<strong>{tag?.name}</strong>"?</p>
              <p className={styles.deleteWarning}>
                Esta acción no se puede deshacer.
              </p>
              
              <div className={styles.deleteActions}>
                <button 
                  className={styles.btnSecondary}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Cancelar
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            placeholder="Nombre *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            disabled={loading || deleteLoading}
            maxLength={50} // ✅ Limitar longitud
          />

          <div className={styles.colorPickerContainer}>
            <label className={styles.colorPickerLabel}>
              Color:
            </label>
            
            <div className={styles.selectedColorDisplay}>
              <div 
                className={styles.colorPreview}
                style={{ backgroundColor: color }}
              />
              <span className={styles.selectedColorValue}>{color}</span>
            </div>

            <div className={styles.colorGrid}>
              {defaultColors.map((defaultColor) => (
                <button
                  key={defaultColor}
                  type="button"
                  onClick={() => setColor(defaultColor)}
                  className={color === defaultColor ? styles.colorButtonSelected : styles.colorButton}
                  style={{ backgroundColor: defaultColor }}
                  disabled={loading || deleteLoading}
                  aria-label={`Seleccionar color ${defaultColor}`}
                />
              ))}
            </div>

            <div className={styles.customColorContainer}>
              <label className={styles.customColorLabel}>
                Color personalizado:
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={styles.colorInput}
                disabled={loading || deleteLoading}
              />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.actions}>
            {isEditMode ? (
              <div className={styles.leftActions}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className={styles.btnDanger}
                  disabled={loading || deleteLoading}
                >
                  Eliminar
                </button>
              </div>
            ) : (
              <div className={styles.leftActions} />
            )}

            <div className={styles.rightActions}>
              <button 
                className={styles.btnSecondary}
                onClick={handleClose}
                type="button"
                disabled={loading || deleteLoading}
              >
                Cancelar
              </button>
              <button
                className={styles.btnPrimary}
                type="submit"
                disabled={loading || deleteLoading}
              >
                {loading ? (isEditMode ? "Actualizando..." : "Creando...") : (isEditMode ? "Actualizar" : "Crear")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagCreateModal;