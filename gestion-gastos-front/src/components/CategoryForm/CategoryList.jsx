import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import CategoryIcon from "./CategoryIcon";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchCategories = async (e) => {
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
      <h2>Mis Categorías ({categories.length})</h2>
      
      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No tienes categorías</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            Recargar
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map(category => (
            <div 
              key={category.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px'
              }}
            >
              <CategoryIcon iconName={category.icon}
                size={24}
                color="#495957"
              />  
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {category.name}
                </div>
                {category.description && (
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {category.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;