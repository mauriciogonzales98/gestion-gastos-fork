import React from "react";
import createWallet from "./createWallet/CreateWallet";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WalletSelector.module.css";

function normalizeWallets(input) {
  const arr = Array.isArray(input)
    ? input
    : input && Array.isArray(input.data)
    ? input.data
    : [];

  return arr.map((w) => {
    const id = w.id ?? w._id ?? null;
    const name = w.name ?? `Wallet ${id ?? ""}`;
    const coin = w.coin ?? w.currency ?? "";
    
    // Usar los valores calculados del backend
    const spend = typeof w.spend === "number" ? w.spend.toFixed(2) : "0.00";
    const income = typeof w.income === "number" ? w.income.toFixed(2) : "0.00";
    const balance = typeof w.balance === "number" ? w.balance.toFixed(2) : "0.00";

    return {
      id: Number(id),
      name,
      coin,
      spend,
      income,
      balance,
      user: w.user ?? w.userid ?? null,
    };
  });
}

const WalletSelector = ({
  wallets,
  selectedWalletId,
  onWalletSelect,
  loading,
  user,
}) => {
  // Validar que wallets sea un array
  const navigate = useNavigate();
  const safeWallets = normalizeWallets(wallets);
  const selectedWallet = safeWallets.find((w) => w.id === selectedWalletId);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

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
        <button
          onClick={(e) => {
            setIsCreatingWallet(true);
            console.log(isCreatingWallet);
            navigate("/create-wallet");
          }}
          className={styles.createButton}
        >
          Crear Primera Wallet
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: "20px 0",
        padding: "20px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        color: "white",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <label
            style={{
              fontWeight: "bold",
              marginRight: "10px",
              fontSize: "18px",
            }}
          >
            Seleccionar Wallet:
          </label>
          <select
            value={selectedWalletId || ""}
            onChange={(e) => onWalletSelect(parseInt(e.target.value))}
            style={{
              padding: "10px 15px",
              borderRadius: "6px",
              border: "none",
              fontSize: "16px",
              backgroundColor: "white",
              color: "#333",
              minWidth: "200px",
            }}
          >
            <option value="">Selecciona una wallet</option>
            {safeWallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name} ${wallet.balance || "0.00"}
              </option>
            ))}
          </select>
        </div>

        {selectedWallet && (
          <div
            style={{
              padding: "12px 20px",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "8px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>
              Wallet seleccionada: {selectedWallet.name}
            </div>
            <div style={{ fontSize: "14px", opacity: "0.9" }}>
              Balance: ${selectedWallet.balance || "0.00"}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          setIsCreatingWallet(true);
          console.log(isCreatingWallet);
          navigate("/create-wallet");
        }}
        style={{
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Crear Wallet
      </button>
    </div>
  );
};

export default WalletSelector;
