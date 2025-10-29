import { useState } from "react";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { fbDeleteUser } from "../../../Firebase/auth.js";
import Form from "react-bootstrap/Form";

const DeleteAccount = ({
  setIsDeletingAccount,
  errorMessage,
  setErrorMessage,
  onSuccess,
  onCancel,
  isGoogleUser,
}) => {
  //Estado local
  const [isDeleting, setIsDeleting] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    setErrorMessage("");

    //Obtiene datos del formulario y los transforma en un objeto
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    // const isGoogleUser = user.providerData.some(
    //   (provider) => provider.providerId === "google.com"
    // );

    try {
      if (!user) {
        throw new Error("No hay usuario logueado");
      }

      // Re-autenticación
      if (isGoogleUser) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await reauthenticateWithPopup(user, provider);
      } else {
        const password = payload.password;
        if (!password) {
          throw new Error("Se requiere contraseña para eliminar la cuenta");
        }
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Obtener token y eliminar del backend
      const token = await user.getIdToken(true);
      const response = await fetch(
        `http://localhost:3001/api/user/${user.uid}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error del servidor");
      } else console.log("Borrado del BE exitoso");

      // Eliminar de Firebase Auth
      await fbDeleteUser(user);

      // Cerrar el formulario
      setIsDeletingAccount(false);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error eliminando cuenta:", err);
      setErrorMessage(err.message);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div>
      <h3>Borrar Cuenta</h3>

      <form onSubmit={handleSubmit}>
        {!isGoogleUser && (
          <Form.Group className="mb-3">
            <Form.Label>Contraseña:</Form.Label>
            <Form.Control
              type="password"
              name="password"
              required
              disabled={isDeleting}
            />
          </Form.Group>
        )}

        <div>
          <button
            type="submit"
            disabled={isDeleting}
            style={{
              backgroundColor: "red",
              color: "white",
              marginRight: "10px",
            }}
          >
            {isDeleting ? "Eliminando..." : "Confirmar Borrado"}
          </button>

          <button type="button" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteAccount;
