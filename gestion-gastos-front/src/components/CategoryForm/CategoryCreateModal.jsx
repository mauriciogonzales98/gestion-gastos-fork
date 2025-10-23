import React, { useEffect, useState } from "react";
import {allIcons} from "./CategoryIcon"; // Asegúrate de importar tu componente
import CategoryIcon from "./CategoryIcon";
import * as FaIcons from 'react-icons/fa';

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 600,
  maxWidth: "95%",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 14,
};

const btnStyle = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};

const iconGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(8, 1fr)",
  gap: "8px",
  marginTop: "10px",
  marginBottom: "15px",
  maxHeight: "300px",
  overflowY: "auto",
  padding: "15px",
  border: "1px solid #eee",
  borderRadius: "6px",
  background: "#fafafa",
};

const iconButtonStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 5px",
  border: "2px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
  cursor: "pointer",
  transition: "all 0.2s",
  fontSize: "10px",
  minHeight: "60px",
};

const selectedIconStyle = {
  ...iconButtonStyle,
  borderColor: "#12824c",
  background: "#f0f9f4",
  transform: "scale(0.95)",
};

const iconNameStyle = {
  marginTop: "5px",
  fontSize: "9px",
  textAlign: "center",
  wordBreak: "break-word",
  maxWidth: "100%",
};

const CategoryCreateModal = ({ isOpen, onClose, onCreate, token, onUpdate }) => {
  if (!isOpen) return null;
  
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    if(category && isOpen) {
      setName(category.name || "");
      setIcon(category.icon || "");
      setDescription(category.description || "");
    } else {
      setName("");
      setIcon("");
      setDescription("");
    }
  }, [category, isOpen]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nombre requerido");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const categoryData = {
        name: name.trim(),
        icon: icon.trim() || "",
        description: description.trim() || "",
      };

      let res;
      if(category){
        res = await fetch(`http://localhost:3001/api/category/${category.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(categoryData),
        });
      }
      else{
        res = await fetch("http://localhost:3001/api/category/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(categoryData),
        });
      }

      const json = await res.json();
      if (res.ok && (json.success === undefined || json.success === true)) {
        const resultado = json.data || json;
        
        if(category){
          onUpdate(resultado);
        }
        else{
          onCreate(resultado);
        }
        handleClose();
      } else {
        setError(json.message || "Error al crear categoría");
      }
    } catch (err) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  };

  const handleIconSelect = (iconName) => {
    setIcon(iconName);
    setShowIconPicker(false);
    setSearchTerm("");
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setIcon("");
    setShowIconPicker(false);
    setSearchTerm("");
    setError("");
    onClose();
  };

  // Filtrar iconos basado en la búsqueda
  const filteredIcons = allIcons.filter(iconName =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0 }}>Crear nueva categoría</h3>
        <form onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            placeholder="Nombre *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            disabled={loading}
          />
          
          <input
            style={inputStyle}
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          {/* Selector de Iconos */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
              Icono (opcional):
            </label>
            
            {icon && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                <CategoryIcon iconName={icon} size={24} />
                <span style={{ fontSize: 14, fontWeight: '500' }}>{icon}</span>
                <button 
                  type="button"
                  onClick={() => setIcon("")}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ff4444', 
                    cursor: 'pointer',
                    fontSize: 14,
                    marginLeft: 'auto'
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              style={{
                ...btnStyle,
                background: '#f8f9fa',
                border: '1px solid #ddd',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
              disabled={loading}
            >
              <CategoryIcon iconName={icon || "FaQuestionCircle"} size={16} />
              {icon ? `Cambiar icono (${icon})` : "Seleccionar icono"}
            </button>

            {showIconPicker && (
              <div>
                {/* Barra de búsqueda */}
                <input
                  style={{ ...inputStyle, marginBottom: 10 }}
                  placeholder="Buscar icono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div style={iconGridStyle}>
                  {filteredIcons.length > 0 ? (
                    filteredIcons.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleIconSelect(iconName)}
                        style={icon === iconName ? selectedIconStyle : iconButtonStyle}
                      >
                        <CategoryIcon iconName={iconName} size={20} />
                        <span style={iconNameStyle}>
                          {iconName.replace('Fa', '')}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
                      No se encontraron iconos
                    </div>
                  )}
                </div>
                
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '5px' }}>
                  {filteredIcons.length} de {allIcons.length} iconos
                </div>
              </div>
            )}
          </div>

          {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button 
              style={{ ...btnStyle, background: "#e9ecef" }} 
              onClick={handleClose}
              type="button"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              style={{ 
                ...btnStyle, 
                background: loading ? "#ccc" : "#12824c", 
                color: "#fff" 
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryCreateModal;