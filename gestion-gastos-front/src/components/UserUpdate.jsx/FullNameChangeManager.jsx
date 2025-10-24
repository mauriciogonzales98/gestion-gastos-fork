import { useState } from "react";
import { useToken } from "../../Contexts/tokenContext/TokenContext";

const FullNameChange = ({ onCancel, userId }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const { token } = useToken();
  const [editedValues, setEditedValues] = useState({});

  const handleInputChange = (field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e, userId, editedValues) => {
    if (!token) {
      token = await refreshToken();
    }
    const updates = {
      name: editedValues.name,
      surname: editedValues.surname,
    };

    await updateFullName(userId, updates, token);
    setEditedValues({});
  };
  const updateFullName = async (userId, updates, token) => {
    try {
      const response = await fetch(`http://localhost:3001/api/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
      }
    } catch (err) {
      console.error("FE: Error cambiando nombre completo:", err);
      setErrorMessage(
        "Error cambiando nombre. Asegúrate de que cumpla con los requisitos."
      );
      return;
    }
  };

  return (
    <>
      <>
        {errorMessage && <div>{errorMessage}</div>}
        <label>Nuevo Nombre:</label>
        <input
          type="text"
          id="newName"
          name="newName"
          maxLength="50"
          onChange={(e) => handleInputChange("name", e.target.value)}
        />
        <label>Nuevo Apellido:</label>{" "}
        <input
          type="text"
          id="newSurname"
          name="newSurname"
          onChange={(e) => handleInputChange("surname", e.target.value)}
          maxLength="50"
        />
        <button
          type="submit"
          onClick={async (e) => {
            await handleSave(e, userId, editedValues);
          }}
        >
          Modificar
        </button>
        <button type="button" onClick={onCancel} disabled={isChanging}>
          Cancelar
        </button>
      </>
    </>
  );
};
export default FullNameChange;
