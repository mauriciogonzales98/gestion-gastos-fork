import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import CategoryIcon from "./CategoryIcon";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) { throw new Error("Usuario no autenticado"); }

        const token = await user.getIdToken();
        
        const response = await fetch('http://localhost:3001/api/category/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data);
        } else {
          throw new Error(data.message || "Error al cargar categorías");
        }
        
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Estados de carga y error
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Cargando categorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <div>Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: '10px', padding: '5px 10px' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar categorías
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
        Mis Categorías ({categories.length})
      </h2>
      
      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No tienes categorías creadas</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              marginTop: '10px'
            }}
          >
            Recargar
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 100px))',
          gap: '15px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {categories.map(category => (
            <div 
              key={category.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '15px 5px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                width: '90px',
                height: '90px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Icono redondo */}
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <CategoryIcon 
                  iconName={category.icon} 
                  size={24} 
                  color="#495057" 
                />
              </div>
              
              {/* Nombre de la categoría */}
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '0.85rem',
                color: '#495057',
                lineHeight: '1.2',
                maxWidth: '80px',
                wordWrap: 'break-word'
              }}>
                {category.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;