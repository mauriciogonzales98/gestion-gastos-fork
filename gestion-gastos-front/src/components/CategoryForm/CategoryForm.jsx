import React, { useState, useEffect } from "react";
import CategoryList from "../CategoryForm/CategoryList";
import CategoryCreateModal from "./CategoryCreateModal";
import styles from "./CategoryForm.module.css";
import { getAuth, onIdTokenChanged } from "firebase/auth";

const CategoryForm = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Obtener token y escuchar cambios de sesión
  useEffect(() => {
    const auth = getAuth();
    let mounted = true;

    const updateToken = async (user) => {
      if (!mounted) return;
      if (user) {
        try {
          const t = await user.getIdToken();
          if (mounted) setToken(t);
        } catch (err) {
          console.error("Error obteniendo token:", err);
          if (mounted) setToken(null);
        }
      } else {
        if (mounted) setToken(null);
      }
    };

    // initial
    updateToken(auth.currentUser);

    // suscribir a cambios de token / login-logout
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      updateToken(user);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Cargar categorías cuando haya token (o al montar si tu backend usa cookies)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const headers = token
          ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };
        const res = await fetch("http://localhost:3001/api/category/", {
          method: "GET",
          headers,
          // si tu backend usa cookies de sesión puedes añadir credentials: "include"
        });
        const json = await res.json();
        const data = Array.isArray(json) ? json : json?.data ?? [];
        if (mounted) setCategories(data);
      } catch (err) {
        console.error(err);
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // sólo carga si el endpoint requiere token; si tu backend acepta sin token, puedes llamar siempre
    load();

    return () => {
      mounted = false;
    };
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
          onClick={() => setShowCreate(true)}
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