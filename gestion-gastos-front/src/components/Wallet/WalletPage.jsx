import { useEffect } from "react";
import CreateWallet from "./createWallet/CreateWallet.jsx";
import { useState } from "react";
import DeleteWallet from "./deleteWallet/DeleteWalletManager.jsx";
import { useToken } from "../../Contexts/fbTokenContext/TokenContext.jsx";
import WalletLoading from "./WalletLoading.jsx";
import styles from "../Pages/Main.module.css";

const WalletPage = () => {
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const { token } = useToken();
  const [errorMessage, setErrorMessage] = useState("");
  const [walletDeleted, setWalletDeleted] = useState(false);

  const handleWalletDeleted = () => {
    setWalletDeleted((prev) => !prev);
    setSelectedWalletId(null);
    localStorage.removeItem("selectedWalletId");
  };

  //Carga la wallet seleccionada del localStorage al montar el componente
  useEffect(() => {
    const savedWalletId = localStorage.getItem("selectedWalletId");
    if (
      savedWalletId &&
      savedWalletId !== "null" &&
      savedWalletId !== "undefined"
    ) {
      setSelectedWalletId(Number(savedWalletId));
    }
  }, [token]);

  return (
    <>
      <div className="wallet-container">
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
        <section className="create-wallet-section">
          <CreateWallet />
        </section>
        <div className={styles.walletCard}>
          <h2 className={styles.cardTitle}>Seleccionar Wallet</h2>
          <div className={styles.walletSelector}>
            <WalletLoading
              token={token}
              selectedWalletId={selectedWalletId}
              setSelectedWalletId={setSelectedWalletId}
              refreshTrigger={walletDeleted}
            />
          </div>
        </div>
        {selectedWalletId ? (
          <div>
            <DeleteWallet
              walletId={selectedWalletId}
              token={token}
              setErrorMessage={setErrorMessage}
              onDelete={handleWalletDeleted}
            />
          </div>
        ) : (
          <p>Please select a wallet first</p>
        )}
      </div>
    </>
  );
};

export default WalletPage;
