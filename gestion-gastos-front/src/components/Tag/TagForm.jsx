// src/components/Tag/TagForm.jsx
import { useState, useEffect, useCallback } from "react";
import TagList from "./TagList.jsx";
import TagCreateModal from "./TagCreateModal.jsx";
import styles from "./TagForm.module.css";
import { getAuth } from "firebase/auth";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const TagForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      user.getIdToken().then((t) => {
        setToken(t);
      });
    }
  }, []);

  const fetchTags = useCallback(async () => {
    if (!token) return;
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
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setTags(list);
    } catch (error) {
      console.error("Error loading tags:", error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTags();
  }, [token, fetchTags]);

  const handleCreated = (newTag) => {
    setTags((prev) => [...prev, newTag]);
    setShowModal(false);
  };

  const handleUpdated = (updatedTag) => {
    setTags((prev) =>
      prev.map((t) =>
        String(t.id) === String(updatedTag.id) ? updatedTag : t
      )
    );
    setShowModal(false);
    setEditingTag(null);
  };

  const handleDeleted = (deletedTagId) => {
    setShowModal(false);
    setEditingTag(null);
    setTags((prev) =>
      prev.filter((t) => String(t.id) !== String(deletedTagId))
    );
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingTag(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingTag(null);
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
        <h1 className={styles.title}>Etiquetas</h1>
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
          + Nueva etiqueta
        </button>
      </div>

      <TagList
        tags={tags}
        loading={loading}
        onEdit={handleEdit}
      />

      <TagCreateModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onCreate={handleCreated}
        onUpdate={handleUpdated}
        onDelete={handleDeleted}
        token={token}
        tag={editingTag}
      />
    </div>
  );
};

export default TagForm;