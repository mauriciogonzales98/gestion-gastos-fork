import styles from "./WalletSelector.module.css";
import WalletLoading from "./WalletLoading";

const WalletSelector = ({ selectedWalletId, loading, safeWallets }) => {
  const selectedWallet = safeWallets.find((w) => w.id === selectedWalletId);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div>Cargando wallets...</div>
      </div>
    );
  }

  if (!safeWallets || safeWallets.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>No tienes wallets creadas.</p>
        <button className={styles.createButton}>Crear Primera Wallet</button>
      </div>
    );
  }

  return (
    <>
      {/* <div>
          <label className={styles.label}>Seleccionar Wallet:</label>
          <select
            value={selectedWalletId || ""}
            onChange={(e) => onWalletSelect(parseInt(e.target.value))}
            className={styles.select}
          >
            <option value="">Selecciona una wallet</option>
            {safeWallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name} - ${wallet.balance || "0.00"}
              </option>
            ))}
          </select>
        </div> */}

      {selectedWallet && (
        <div className={styles.selectedWallet}>
          <div className={styles.walletName}>
            Wallet seleccionada: {selectedWallet.name}
          </div>
          <div className={styles.walletBalance}>
            Balance: $ {selectedWallet.balance || "0.00"}
          </div>
        </div>
      )}
    </>
  );
};

export default WalletSelector;
