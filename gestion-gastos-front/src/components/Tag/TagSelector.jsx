import React, { useState, useEffect } from 'react';
import TagBadge from './TagBadge.jsx';
import styles from './TagSelector.module.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const TagSelector = ({ selectedTagId, onTagSelect, token, dropdownDirection = "down" }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTags();
    }
  }, [token]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/tag/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      const tagList = Array.isArray(data) ? data : data?.data ?? [];
      setTags(tagList);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTag = tags.find(tag => String(tag.id) === String(selectedTagId));

  const handleTagSelect = (tag) => {
    onTagSelect(tag.id);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onTagSelect(null);
    setShowDropdown(false);
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.selector}>
        <div 
          className={styles.selectedContainer}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className={styles.selectedContent}>
            {selectedTag ? (
              <TagBadge tag={selectedTag} />
            ) : (
              <span className={styles.placeholder}>Seleccionar etiqueta...</span>
            )}
          </div>
          <span className={styles.arrow}>▼</span>
        </div>

        {showDropdown && (
          <div className={`${styles.dropdown} ${dropdownDirection === "up" ? styles.dropdownUp : styles.dropdownDown}`}>
            {loading ? (
              <div className={styles.loading}>Cargando tags...</div>
            ) : (
              <>
                <div className={styles.dropdownHeader}>
                  <span>Seleccionar etiqueta</span>
                  <button 
                    type="button"
                    onClick={handleClear}
                    className={styles.clearButton}
                  >
                    Limpiar
                  </button>
                </div>
                
                <div className={styles.tagsList}>
                  <div key="no-tag" className={styles.tagOption} onClick={()=>{handleTagSelect({id: -1})}}>Sin etiqueta</div>
                  {tags.map(tag => (
                    <div
                      key={tag.id}
                      className={styles.tagOption}
                      onClick={() => handleTagSelect(tag)}
                    >
                      <TagBadge tag={tag} />
                    </div>
                  ))}
                  
                  {tags.length === 0 && (
                    <div className={styles.noTags}>
                      No hay etiquetas creadas
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;