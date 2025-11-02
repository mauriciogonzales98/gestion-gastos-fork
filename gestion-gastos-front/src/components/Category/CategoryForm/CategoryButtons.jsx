import CategoryIcon from "./CategoryIcon";
import styles from "./CategoryButtons.module.css";
import { useState, useEffect } from "react";
import { useToken } from "../../../Contexts/fbTokenContext/TokenContext";

const CategoryButtons = ({ selectedId, onSelect }) => {
  const { token } = useToken();
  const [categories, setCategories] = useState([]);
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
            className={`${styles.button} ${
              isSelected ? styles.buttonSelected : ""
            }`}
          >
            <CategoryIcon iconName={cat.icon} size={18} />
            <span className={styles.label}>
              {cat.name ?? cat.label ?? "Cat"}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryButtons;
