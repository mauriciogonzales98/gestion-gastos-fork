import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import CategoryIcon from "./CategoryIcon";
import styles from "./CategoryList.module.css";

const CategoryList = ( {onEdit} ) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          throw new Error("Usuario no autenticado");
        }

        const token = await user.getIdToken();

        const response = await fetch(`http://localhost:3001/api/category/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setCategories(data.data);
        } else {
          throw new Error(data.message || "Error al cargar categorías");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
            >
              <div className={styles.iconContainer}>
                <CategoryIcon 
                  iconName={category.icon} 
                  size={24} 
                  color="#495057" 
                />
              </div>
              {onEdit && (
                <button
                  className={styles.editButton}
                  onClick={() =>  onEdit && onEdit(category)}
                >
                  ✏️
                </button>
              )}

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
