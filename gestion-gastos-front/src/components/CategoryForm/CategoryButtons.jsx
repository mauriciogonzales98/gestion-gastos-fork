import React from "react";
import CategoryIcon from "./CategoryIcon";

const CategoryButtons = ({ categories = [], selectedId, onSelect }) => {
  if (!categories || categories.length === 0) {
    return <div style={{ color: "#666" }}>No hay categorías</div>;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {categories.map((cat) => {
        const isSelected = String(cat.id) === String(selectedId);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(isSelected ? "" : cat.id)}
            aria-pressed={isSelected}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              border: isSelected ? "2px solid #333" : "1px solid #ddd",
              background: isSelected ? "#f0f0f0" : "#fff",
              cursor: "pointer",
              color: "#333",
              fontWeight: isSelected ? 700 : 500,
            }}
          ><CategoryIcon iconName={cat.icon} size={18} />  
            <span style={{ fontSize: 14 }}>{cat.name ?? cat.label ?? "Cat"}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryButtons;