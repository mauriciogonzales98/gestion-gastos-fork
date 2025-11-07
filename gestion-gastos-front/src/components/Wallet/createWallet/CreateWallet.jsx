import Form from "react-bootstrap/Form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import styles from "./CreateWallet.module.css";

const CreateWallet = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreation = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      setErrorMessage("Usuario no autenticado");
      setIsLoading(false);
      return;
    }

    console.log("Creando Wallet en BE");

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    payload.userId = user.uid;
    payload.income = 0;
    payload.spend = 0;

    try {
      const token = await user.getIdToken(true);

      const response = await fetch(`http://localhost:3001/api/wallet/`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        console.log("Wallet Creada");
        navigate("/main");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData?.message || "Error al crear la Wallet");
      }
    } catch (err) {
      setErrorMessage("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/main");
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${isLoading ? styles.loading : ""}`}>

        <h2 className={styles.title}>Crear Nueva Wallet</h2>
        
        {errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleCreation}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre de la Wallet
            </label>
            <Form.Control
              type="text"
              id="name"
              name="name"
              maxLength={50}
              required
              className={styles.input}
              placeholder="Nombre "
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="coin" className={styles.label}>
              Moneda
            </label>
            <Form.Select 
              id="coin" 
              name="coin" 
              required 
              className={styles.select}
              disabled={isLoading}
            >
              <option value="">Selecciona una moneda</option>
              <option value="ARS">$ARS - Peso Argentino</option>
              <option value="USD">$USD - Dólar Estadounidense</option>
              <option value="EUR">$EUR - Euro</option>
              <option value="GBP">$GBP - Libra Esterlina</option>
            </Form.Select>
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Creando Wallet..." : "Crear Wallet"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWallet;