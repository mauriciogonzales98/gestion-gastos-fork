import { useState } from "react";
import styles from "./DeleteWallet.module.css";

const DeleteWallet = ({ walletId, token, setErrorMessage, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleDelete = async () => {
    setIsLoading(true);
    setErrorMessage("");
    const confirmed = window.confirm(
      "Advertencia: Esto borrará PERMANENTEMENTE la cartera y todas sus operaciones. ¿Desea continuar?"
    );
    if (!confirmed) {
      setIsLoading(false);
      setErrorMessage("Eliminación cancelada por el usuario");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3001/api/wallet/${walletId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Wallet deleted successfully
        console.log("Wallet deleted successfully");
        onDelete();
        setErrorMessage("Cartera borrada exitosamente");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Error deleting wallet");
      }
    } catch (error) {
      console.error("Error deleting wallet:", error);
      setErrorMessage("Error deleting wallet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${styles.deleteContainer} ${isLoading ? styles.loading : ""}`}
    >
      <button
        className={styles.deleteButton}
        onClick={handleDelete}
        disabled={isLoading}
      >
        {isLoading ? "Deleting..." : "Delete Wallet"}
      </button>
    </div>
  );
};
export default DeleteWallet;
