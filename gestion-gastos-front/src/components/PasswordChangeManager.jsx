import { useState } from "react";
import { fbPasswordChange } from "../Firebase/auth.js";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import Form from "react-bootstrap/form";

const ChangePassword = ({
  //Props
  setIsChangingPassword,
  errorMessage,
  setErrorMessage,
  onCancel,
}) => {
  //Estado local
  const [isChanging, setIsChanging] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleChange = async (e) => {
    // Previene que React ejecute dos veces la función en modo desarrollo
    e.preventDefault();
    setIsChanging(true);
    setErrorMessage("");

    //Obtiene datos del formulario y los transforma en un objeto
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    try {
      // Verifica que la contraseña nueva no sea igual a la anterior
      if (payload.oldPassword === payload.newPassword) {
        setErrorMessage("La nueva contraseña no puede ser igual a la anterior");
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        payload.oldPassword
      );
      await reauthenticateWithCredential(user, credential);
    } catch (reauthError) {
      setErrorMessage("La contraseña actual es incorrecta");
      console.error("FE: Error cambiando contraseña:", reauthError);
      return;
    }

    //Cambia la contraseña en Firebase Auth
    try {
      await fbPasswordChange(payload.newPassword);
    } catch (err) {
      console.error("FE: Error cambiando contraseña:", err);
      setErrorMessage(
        "Error cambiando la contraseña. Asegúrate de que cumpla con los requisitos."
      );
      return;
    }
    console.log("Contraseña Cambiada exitosamente");
    setIsChangingPassword(false);
  };
  return (
    <>
      {errorMessage && <div>{errorMessage}</div>}

      <form onSubmit={handleChange}>
        <label>Contraseña Actual:</label>
        <Form.Control
          type="password"
          id="oldPassword"
          name="oldPassword"
          required
        />
        <label>Nueva Contraseña:</label>{" "}
        <Form.Control
          type="password"
          id="newPassword"
          name="newPassword"
          required
        />
        <button type="submit">Cambiar Contraseña</button>
      </form>

      <button type="button" onClick={onCancel} disabled={isChanging}>
        Cancelar
      </button>
    </>
  );
};
export default ChangePassword;
