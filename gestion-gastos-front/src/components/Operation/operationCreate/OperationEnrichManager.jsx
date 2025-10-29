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

export const loadEnrichedOperations = async (walletId, token) => {
  //Obtiene todas las operaciones del usuario

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
        category: fullCategory || operation.categoryid, // Replace categoryid with full object or null
      };
    });
  };

  try {
    //operations, categories y enrichedOperations son los tres objetos
    const operations = await loadOperations(walletId, token);
    const categories = await loadCategories(token);
    const enrichedOperations = enrichOperationsWithCategories(
      operations,
      categories
    );
    // console.log("enriched operations: ", enrichedOperations);
    // console.log("operations pre enrichment: ", operations);
    // console.log("categories: ", categories);
    // console.log("enriched operations: ", typeof enrichedOperations);
    // console.log("operations pre enrichment: ", typeof operations);
    // console.log("categories: ", typeof categories);
    return enrichedOperations;
  } catch (error) {
    console.log("Error enriching categories: ", error);
  }
};
