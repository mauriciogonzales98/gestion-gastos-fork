import CategoryIcon from "./CategoryIcon";
import styles from "./CategoryButtons.module.css";
import { useState, useEffect } from "react";
import { useToken } from "../../../Contexts/fbTokenContext/TokenContext";

const CategoryDropdown = ({ selectedId, onSelect }) => {
  const { token } = useToken();
  const [categories, setCategories] = useState([]);
  const handleCategorySelect = (categoryId) => {
    onSelect(categoryId);
  };
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
          setCategories(data.data.sort((a, b) => {
          const nameA = a.name.toUpperCase(); // ignore upper and lowercase
          const nameB = b.name.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
}));
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
    <>
      <select
        value={selectedId || ""}
        onChange={(e) => handleCategorySelect(parseInt(e.target.value))}
      >
        { <option key={0} value={0}> ------------ </option> }
        <option key={-1} value={-1} >Sin Categoría </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}{" "}
          </option>
        ))}
      </select>
    </>
  );
};

export default CategoryDropdown;
