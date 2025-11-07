
  //Obtiene un objeto que contiene todas las operaciones del usuario
  const loadOperations = async (walletId, token) => {
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
  const loadCategories = async (token) => {
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

//Obtiene un objeto que contiene todas las etiquetas del usuario
  const loadTags = async (token) => {
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
        return tagsData.data;
      }
    } catch (error) {
      console.error("Error loading tags:", error);
      return;
    }
  };

  //Obtiene todas las operaciones del usuario

  // Obtiene los objetos completos de category y tag a partir de los ids.
  const enrichOperations = (operations, categories, tags) => {
    return operations.data.map((operation) => {
      const fullCategory = categories.find(
        (cat) => cat.id == operation.categoryid
      );
      const fullTag = tags.find((tag) => tag.id == operation.tagid);


      return {
        ...operation,
        category: fullCategory || null,
        tag: fullTag || null
         
      };
    });
  };
  
// Devuelve un array de operaciones enriquecidas con los objetos completos de category y tag 
export const loadEnrichedOperations = async (walletId, token) => {

  try {
    //operations, categories y enrichedOperations son objetos
    const [operations, categories, tags] = await Promise.all([
      loadOperations(walletId, token),
      loadCategories(token),
      loadTags(token),
    ])
    return enrichOperations(
      operations,
      categories,
      tags
    );

   
  } catch (error) {
    throw error;
  }
};