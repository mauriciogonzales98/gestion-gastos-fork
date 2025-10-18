import { useToken } from "../../Contexts/tokenContext/TokenContext";

const deleteOperation = async (operationId, token) => {
  //DEBUG
  console.log("Token en deleteOperation: ", token);
  console.log("id de la operación en deleteOperation: ", operationId);
  if (!token) {
    throw new Error("no auth token available");
  }
  try {
    const response = await fetch(
      `http://localhost:3001/api/operation/${operationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      const newToken = await refreshtoken();
      if (newToken) {
        return deleteOperation(operationId);
      }
    } else if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error eliminando operación");
    } else {
      console.log("operación eliminada exitosamente");
    }

    return await response.json();
  } catch (error) {
    console.log("Error al eliminar la operación: ", error);
  }
};

export default deleteOperation;
