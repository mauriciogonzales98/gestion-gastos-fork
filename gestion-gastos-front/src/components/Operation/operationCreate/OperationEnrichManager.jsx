// Añade a los objetos operation del front el objeto completo de category en lugar de solo el id, para poder mostrar la información necesaria en
// el listado de operaciones.
export const loadOperations = async (walletId, token) => {
  if (!walletId || !token) return;
  try {
    const response = await fetch(
      `http://localhost:3001/api/operation/wallet/${walletId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      const operationsData = await response.json();
      return operationsData;
    }
  } catch (error) {
    console.error("Error loading operations:", error);
    return;
  }
};

//Obtiene un objeto que contiene todas las categorías del usuario
export const loadCategories = async (token) => {
  if (!token) return;
  try {
    const response = await fetch("http://localhost:3001/api/category", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const categoriesData = await response.json();
      return categoriesData.data;
    }
  } catch (error) {
    console.error("Error loading categories:", error);
    return;
  }
};

// AGREGAR ESTA NUEVA FUNCIÓN PARA CARGAR TAGS
export const loadTags = async (token) => {
  if (!token) return;
  try {
    const response = await fetch("http://localhost:3001/api/tag", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const tagsData = await response.json();
      return Array.isArray(tagsData) ? tagsData : tagsData?.data ?? [];
    }
  } catch (error) {
    console.error("Error loading tags:", error);
    return [];
  }
};

export const loadEnrichedOperations = async (walletId, token) => {
  // Reemplaza el id almacenado en operation.category por el objeto completo
  const enrichOperationsWithCategories = (operations, categories) => {
    return operations.data.map((operation) => {
      const fullCategory = categories.find(
        (cat) => cat.id == operation.categoryid
      );
      //DEBUG
      console.log("FullCategory", fullCategory);

      return {
        ...operation,
        category: fullCategory || operation.categoryid, // Reemplaza el id por el objeto completo de categoría si lo encuentra
      };
    });
  };

  // AGREGAR ESTA NUEVA FUNCIÓN PARA ENRIQUECER CON TAGS
  const enrichOperationsWithTags = (operations, tags) => {
    return operations.map((operation) => {
      const fullTag = tags.find((tag) => tag.id == operation.tagid);
      
      return {
        ...operation,
        tag: fullTag || null, // Agrega el objeto completo del tag si existe
      };
    });
  };

  try {
    //operations, categories y enrichedOperations son los tres objetos
    const operations = await loadOperations(walletId, token);
    const categories = await loadCategories(token);
    const tags = await loadTags(token); // AGREGAR CARGA DE TAGS
    
    // Primero enriquece con categorías
    let enrichedOperations = enrichOperationsWithCategories(operations, categories);
    
    // Luego enriquece con tags
    enrichedOperations = enrichOperationsWithTags(enrichedOperations, tags);
    
    console.log("Operaciones enriquecidas con tags:", enrichedOperations);
    return enrichedOperations;
  } catch (error) {
    console.log("Error enriching operations: ", error);
  }
};