import { useState, useEffect, useCallback } from "react";
import CategoryList from "../CategoryForm/CategoryList";
import CategoryCreateModal from "./CategoryCreateModal";
import styles from "./CategoryForm.module.css";
import { getAuth } from "firebase/auth";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

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

  // Función de carga reutilizable
  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/category/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setCategories(list);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Cargar categorías cuando haya token
  useEffect(() => {
    fetchCategories();
  }, [token, fetchCategories]);

  // --- Cambios: manejar create/update/delete localmente en lugar de refetch ---
  const handleCreated = (newCategory) => {
    // Añadir al principio del arreglo local
    setCategories((prev) => [...prev, newCategory]);
    setShowModal(false);
  };

  const handleUpdated = (updatedCategory) => {
    // Reemplazar el elemento en el arreglo local
    setCategories((prev) =>
      prev.map((c) =>
        String(c.id) === String(updatedCategory.id) ? updatedCategory : c
      )
    );
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleDeleted = (deletedCategoryId) => {
    // Filtrar localmente la categoría borrada
    setShowModal(false);
    setEditingCategory(null);
    setCategories((prev) =>
      prev.filter((c) => String(c.id) !== String(deletedCategoryId))
    );
  };
  // ------------------------------------------------------------------------

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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

      <CategoryList
        categories={categories}
        loading={loading}
        onEdit={handleEdit}
      />

      <CategoryCreateModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onCreate={handleCreated}
        onUpdate={handleUpdated}
        onDelete={handleDeleted}
        token={token}
        category={editingCategory}
      />
    </div>
  );
};

export default CategoryForm;
