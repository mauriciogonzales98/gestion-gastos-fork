import React from 'react';
import styles from './WalletSelector.module.css';

function normalizeWallets(input) {
  const arr = Array.isArray(input)
    ? input
    : input && Array.isArray(input.data)
    ? input.data
    : [];

  return arr.map((w) => {
    const id = w.id ?? w._id ?? null;
    const name = w.name ?? `Wallet ${id ?? ''}`;
    const coin = w.coin ?? w.currency ?? "";
    const spend = typeof w.spend === "number" ? w.spend.toFixed(2) : w.spend ?? "0.00";
    const income = typeof w.income === "number" ? w.income.toFixed(2) : w.income ?? "0.00";

    const balance =
      w.balance ??
      (Number(w.income ?? 0) - Number(w.spend ?? 0)) ??
      (Number(income) - Number(spend)) ??
      "0.00";

    return {
      id: Number(id),
      name,
      coin,
      spend,
      income,
      balance: typeof balance === "number" ? balance.toFixed(2) : String(balance),
      user: w.user ?? w.userid ?? null,
    };
  });
}

const WalletSelector = ({ wallets, selectedWalletId, onWalletSelect, loading }) => {
  const safeWallets = normalizeWallets(wallets);
  const selectedWallet = safeWallets.find(w => w.id === selectedWalletId);

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
        <button className={styles.createButton}>
          Crear Primera Wallet
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <label className={styles.label}>
            Seleccionar Wallet:
          </label>
          <select 
            value={selectedWalletId || ''} 
            onChange={(e) => onWalletSelect(parseInt(e.target.value))}
            className={styles.select}
          >
            <option value="">Selecciona una wallet</option>
            {safeWallets.map(wallet => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name} - ${wallet.balance || '0.00'}
              </option>
            ))}
          </select>
        </div>

        {selectedWallet && (
          <div className={styles.selectedWallet}>
            <div className={styles.walletName}>
              Wallet seleccionada: {selectedWallet.name}
            </div>
            <div className={styles.walletBalance}>
              Balance: ${selectedWallet.balance || '0.00'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletSelector;