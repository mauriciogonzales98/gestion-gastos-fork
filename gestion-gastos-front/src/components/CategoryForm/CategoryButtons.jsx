import React from "react";
import CategoryIcon from "./CategoryIcon";
import styles from "./CategoryButtons.module.css";

const CategoryButtons = ({ categories = [], selectedId, onSelect }) => {
  if (!categories || categories.length === 0) {
    return <div className={styles.emptyMessage}>No hay categorías</div>;
  }

  return (
    <div className={styles.container}>
      {categories.map((cat) => {
        const isSelected = String(cat.id) === String(selectedId);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(isSelected ? "" : cat.id)}
            aria-pressed={isSelected}
            className={`${styles.button} ${isSelected ? styles.buttonSelected : ""}`}
          >
            <CategoryIcon iconName={cat.icon} size={18} />  
            <span className={styles.label}>{cat.name ?? cat.label ?? "Cat"}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryButtons;