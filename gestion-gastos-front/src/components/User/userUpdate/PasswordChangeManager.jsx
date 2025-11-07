import { useState } from "react";
import { fbPasswordChange } from "../../../Firebase/auth.js";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import styles from "./PasswordChangeManager.module.css";

const ChangePassword = ({
  setIsChangingPassword,
  errorMessage,
  setErrorMessage,
  onCancel,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessOnly, setShowSuccessOnly] = useState(false); // ← Nuevo estado

  const auth = getAuth();
  const user = auth.currentUser;

  // Reglas de validación de contraseña
  const passwordRules = {
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const isPasswordValid = Object.values(passwordRules).every(rule => rule);
  const passwordsMatch = newPassword === confirmPassword;

  const handleChange = async (e) => {
    e.preventDefault();
    setIsChanging(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    try {
      // Verifica que la contraseña nueva no sea igual a la anterior
      if (payload.oldPassword === newPassword) {
        setErrorMessage("La nueva contraseña no puede ser igual a la anterior");
        setIsChanging(false);
        return;
      }

      // Verificar reglas de contraseña
      if (!isPasswordValid) {
        setErrorMessage("La nueva contraseña no cumple con todos los requisitos");
        setIsChanging(false);
        return;
      }

      // Verificar que las contraseñas coincidan
      if (!passwordsMatch) {
        setErrorMessage("Las contraseñas nuevas no coinciden");
        setIsChanging(false);
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        payload.oldPassword
      );
      
      // Reautentica al usuario para realizar la operación
      await reauthenticateWithCredential(user, credential);
    } catch (reauthError) {
      setErrorMessage("La contraseña actual es incorrecta");
      console.error("FE: Error cambiando contraseña:", reauthError);
      setIsChanging(false);
      return;
    }

    // Cambia la contraseña en Firebase Auth
    try {
      await fbPasswordChange(newPassword);
      setSuccessMessage("🎉 ¡Contraseña cambiada exitosamente!");
      setShowSuccessOnly(true); // ← Mostrar solo el mensaje de éxito
      
      // Cerrar después de 3 segundos
      setTimeout(() => {
        setIsChangingPassword(false);
      }, 3000);
      
    } catch (err) {
      console.error("FE: Error cambiando contraseña:", err);
      setErrorMessage("Error cambiando la contraseña. Inténtalo de nuevo.");
    } finally {
      setIsChanging(false);
    }
  };

  // Si hay éxito, mostrar solo el mensaje
  if (showSuccessOnly) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successMessage}>
          {successMessage}
        </div>
        <div className={styles.successSubtitle}>
          El formulario se cerrará automáticamente...
        </div>
      </div>
    );
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleChange}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Contraseña Actual:</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            className={styles.input}
            required
            disabled={isChanging}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Nueva Contraseña:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            className={styles.input}
            required
            disabled={isChanging}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          
          {/* Lista de reglas de contraseña */}
          {newPassword && (
            <div className={styles.passwordRules}>
              <h4 className={styles.rulesTitle}>La nueva contraseña debe contener:</h4>
              <ul className={styles.rulesList}>
                <li className={passwordRules.minLength ? styles.ruleValid : styles.ruleInvalid}>
                  {passwordRules.minLength ? "✅" : "❌"} Mínimo 8 caracteres
                </li>
                <li className={passwordRules.hasUpperCase ? styles.ruleValid : styles.ruleInvalid}>
                  {passwordRules.hasUpperCase ? "✅" : "❌"} Una letra mayúscula
                </li>
                <li className={passwordRules.hasLowerCase ? styles.ruleValid : styles.ruleInvalid}>
                  {passwordRules.hasLowerCase ? "✅" : "❌"} Una letra minúscula
                </li>
                <li className={passwordRules.hasNumber ? styles.ruleValid : styles.ruleInvalid}>
                  {passwordRules.hasNumber ? "✅" : "❌"} Un número
                </li>
                <li className={passwordRules.hasSpecialChar ? styles.ruleValid : styles.ruleInvalid}>
                  {passwordRules.hasSpecialChar ? "✅" : "❌"} Un carácter especial (!@#$%^&* etc.)
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirmar Nueva Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className={styles.input}
            required
            disabled={isChanging}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          {/* Indicador de coincidencia de contraseñas */}
          {confirmPassword && (
            <div className={passwordsMatch ? styles.matchValid : styles.matchInvalid}>
              {passwordsMatch ? "✅" : "❌"} Las contraseñas {passwordsMatch ? "coinciden" : "no coinciden"}
            </div>
          )}
        </div>

        {/* Mensaje de error */}
        {errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isChanging || !isPasswordValid || !passwordsMatch}
          >
            {isChanging ? "Cambiando..." : "Cambiar Contraseña"}
          </button>
          
          <button 
            type="button" 
            onClick={onCancel} 
            className={styles.cancelButton}
            disabled={isChanging}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;