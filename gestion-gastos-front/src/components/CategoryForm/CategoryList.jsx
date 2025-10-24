import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import CategoryIcon from "./CategoryIcon";
import styles from "./CategoryList.module.css";

const CategoryList = ({ categories, loading, onEdit }) => {
  const [error, setError] = useState(null);

  // Función para manejar doble click
  const handleDoubleClick = (category) => {
    if (onEdit) {
      onEdit(category);
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div>Cargando categorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div>Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar categorías
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Mis Categorías ({categories.length})
      </h2>
      
      {categories.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tienes categorías creadas</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.reloadButton}
          >
            Recargar
          </button>
        </div>
      ) : (
        <div className={styles.categoriesGrid}>
          {categories.map(category => (
            <div 
              key={category.id}
              className={styles.categoryCard}
              onDoubleClick={() => handleDoubleClick(category)} // Doble click aquí
              title="Doble click para editar" // Tooltip para indicar la funcionalidad
            >
              <div className={styles.iconContainer}>
                <CategoryIcon 
                  iconName={category.icon} 
                  size={24} 
                  color="#495057" 
                />
              </div>
              
              <div className={styles.categoryName}>
                {category.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;