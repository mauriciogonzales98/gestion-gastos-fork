import { useToken } from "../../../Contexts/tokenContext/TokenContext";

export const updateOperation = async (operationId, updates, token) => {
  const response = await fetch(
    `http://localhost:3001/api/operation/${operationId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update operation");
  }

  return await response.json();
};
