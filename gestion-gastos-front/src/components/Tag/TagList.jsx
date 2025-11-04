import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import TagBadge from "./TagBadge.jsx";
import styles from "./TagList.module.css";

const TagList = ({ tags, loading, onEdit }) => {
  const [error, setError] = useState(null);

  const handleDoubleClick = (tag) => {
    if (onEdit) {
      onEdit(tag);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div>Cargando tags...</div>
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

  return (
    <>
      <h2 className={styles.title}>Mis Tags ({tags.length})</h2>

      {tags.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tienes tags creados</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.reloadButton}
          >
            Recargar
          </button>
        </div>
      ) : (
        <div className={styles.tagsGrid}>
          {tags.map(tag => (
            <div 
              key={tag.id}
              className={styles.tagCard}
              onDoubleClick={() => handleDoubleClick(tag)}
              title="Doble click para editar"
            >
              <TagBadge tag={tag} size="large" />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TagList;