import Form from "react-bootstrap/Form";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const CreateWallet = () => {
  const [errorMessage, setErrorMessage] = useState();
  const navigate = useNavigate();

  const handleCreation = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    console.log(user);
    console.log("CreandoWallet en BE");

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    payload.userId = user.uid;
    payload.income = 0;
    payload.spend = 0;
    console.log(payload.userId);

    console.log(payload);

    // const credential = EmailAuthProvider.credential(user.email, user.password);

    try {
      const token = await user.getIdToken(true);
      //Reautentica al usuario para realizar la operación
      // await reauthenticateWithCredential(user, credential);

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
        console.log(
          "Error al crear Wallet en BE",
          res?.message || "Error desconocido"
        );
      }
    } catch (err) {
      console.log("Error creando walet: ", err);
    }
  };

  return (
    <>
      <form className="wallet-creation-form" onSubmit={handleCreation}>
        <Form.Group>
          <label htmlFor="name">Name</label>
          <Form.Control
            type="text"
            id="name"
            name="name"
            maxLength={50}
            required
          />
          <label htmlFor="coin">coin</label>
          <Form.Select id="coin" name="coin" required className="form-control">
            <option value="ARS">$ARS - Peso Argentino </option>
            <option value="USD">$USD - Dólar Estadounidense </option>
            <option value="EUR">$EUR - Euro </option>
            <option value="GBP">$GBP - Libra Esterlina </option>
          </Form.Select>
        </Form.Group>
        <button type="submit">Crear Wallet</button>
      </form>
    </>
  );
};
export default CreateWallet;
