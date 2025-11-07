import React, { useEffect, useState } from "react";
import { allIcons } from "./CategoryIcon";
import CategoryIcon from "./CategoryIcon";
import styles from "./CategoryCreateModal.module.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const CategoryCreateModal = ({ isOpen, onClose, onCreate, token, onUpdate, category, onDelete }) => {
  if (!isOpen) return null;
  
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (category && isOpen) {
      setName(category.name || "");
      setIcon(category.icon || "");
      setDescription(category.description || "");
    } else if (isOpen) {
      setName("");
      setIcon("");
      setDescription("");
    }
    setShowDeleteConfirm(false);
  }, [category, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nombre requerido");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const categoryData = {
        name: name.trim(),
        icon: icon.trim() || "",
        description: description.trim() || "",
      };

      let res;
      if (category) {
        res = await fetch(`${API_BASE}/api/category/${category.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(categoryData),
        });
      } else {
        res = await fetch(`${API_BASE}/api/category/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(categoryData),
        });
      }

      const json = await res.json();
      if (res.ok && (json.success === undefined || json.success === true)) {
        const resultado = json.data || json;
        
        if (category) {
          onUpdate(resultado);
        } else {
          onCreate(resultado);
        }
        handleClose();
      } else {
        setError(json.message || `Error al ${category ? 'actualizar' : 'crear'} categoría`);
      }
    } catch (err) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  };

  const handleIconSelect = (iconName) => {
    setIcon(iconName);
    setShowIconPicker(false);
    setSearchTerm("");
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setIcon("");
    setShowIconPicker(false);
    setSearchTerm("");
    setError("");
    setShowDeleteConfirm(false);
    onClose();
  };

 const handleDelete = async () => {
  if (!category) return;
  
  setDeleteLoading(true);
  setError("");
  try {
    
    const res = await fetch(`${API_BASE}/api/category/${category.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });

    if (res.status === 204 || res.ok) {
      console.log("Delete successful");
      
      // Llamar a onDelete para que CategoryForm maneje la actualización
      if (onDelete) {
        onDelete(category.id);
      } else {
        console.warn("onDelete prop no definido");
        // Si no hay onDelete, recargar la página como fallback
        window.location.reload();
      }
      
      return; // No llamar handleClose aquí, onDelete se encargará de cerrar el modal
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
    console.error("Error eliminando categoría:", err);
    setError(err.message || "Error al eliminar categoría");
    setDeleteLoading(false);
    setShowDeleteConfirm(false);
  }
};

  const filteredIcons = allIcons.filter(iconName =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isEditMode = !!category;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3>
          {isEditMode ? 'Editar categoría' : 'Crear nueva categoría'}
        </h3>

        {showDeleteConfirm && (
          <div className={styles.deleteOverlay}>
            <div className={styles.deleteModal}>
              <h4>Confirmar eliminación</h4>
              <p>¿Estás seguro de que quieres eliminar la categoría "<strong>{category?.name}</strong>"?</p>
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
          />
          
          <input
            className={styles.input}
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || deleteLoading}
          />

          <div className={styles.iconPickerContainer}>
            <label className={styles.iconPickerLabel}>
              Icono (opcional):
            </label>
            
            {icon && (
              <div className={styles.selectedIconDisplay}>
                <CategoryIcon iconName={icon} size={24} />
                <span className={styles.selectedIconName}>{icon}</span>
                <button 
                  type="button"
                  onClick={() => setIcon("")}
                  className={styles.removeIconBtn}
                  disabled={loading || deleteLoading}
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className={styles.iconPickerToggle}
              disabled={loading || deleteLoading}
            >
              <CategoryIcon iconName={icon || "FaQuestionCircle"} size={16} />
              {icon ? `Cambiar icono (${icon})` : "Seleccionar icono"}
            </button>

            {showIconPicker && (
              <div>
                <input
                  className={styles.iconSearch}
                  placeholder="Buscar icono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading || deleteLoading}
                />
                
                <div className={styles.iconGrid}>
                  {filteredIcons.length > 0 ? (
                    filteredIcons.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleIconSelect(iconName)}
                        className={icon === iconName ? styles.iconButtonSelected : styles.iconButton}
                        disabled={loading || deleteLoading}
                      >
                        <CategoryIcon iconName={iconName} size={20} />
                        <span className={styles.iconName}>
                          {iconName.replace('Fa', '')}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className={styles.noIcons}>
                      No se encontraron iconos
                    </div>
                  )}
                </div>
                
                <div className={styles.iconCount}>
                  {filteredIcons.length} de {allIcons.length} iconos
                </div>
              </div>
            )}
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

export default CategoryCreateModal;