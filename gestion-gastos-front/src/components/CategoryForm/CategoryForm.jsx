import React, { useState, useEffect } from "react";
import CategoryList from "../CategoryForm/CategoryList";
import CategoryCreateModal from "./CategoryCreateModal";
import styles from "./CategoryForm.module.css";
import { getAuth } from "firebase/auth";

const CategoryForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Obtener token - igual que en OperationForm
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      user.getIdToken().then((t) => {
        setToken(t);
      });
    }
  }, []);

  // Cargar categorías - igual que en OperationForm
  useEffect(() => {
    const loadCategories = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/category/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, [token]);

  const handleCreated = (newCategory) => {
    setCategories((prev) => [newCategory, ...prev]);
  };

  const handleUpdated = (updatedCategory) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className={styles.title}>Categorías</h1>
        <button
          onClick={handleCreate}
          style={{
            background: "#12824c",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          + Nueva categoría
        </button>
      </div>

      <CategoryList categories={categories} loading={loading} onEdit={handleEdit}/>

      <CategoryCreateModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onCreate={handleCreated}
        onUpdate={handleUpdated}
        token={token}
        category={editingCategory}
      />
    </div>
  );
};

export default CategoryForm;