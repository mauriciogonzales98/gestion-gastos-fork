import styles from "./WalletSelector.module.css";
import { useState, useEffect } from "react";
import WalletSelector from "./WalletSelector";

const WalletLoading = ({ token, selectedWalletId, setSelectedWalletId }) => {
  const [wallets, setWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(true);

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
      
      // Calculate numeric values first
      const spendValue = typeof w.spend === "number" ? w.spend : parseFloat(w.spend) || 0;
      const incomeValue = typeof w.income === "number" ? w.income : parseFloat(w.income) || 0;
      
      // Calculate balance
      const balanceValue = w.balance ?? incomeValue - spendValue;

      return {
        id: Number(id),
        name,
        coin,
        spend: spendValue.toFixed(2),
        income: incomeValue.toFixed(2),
        balance: typeof balanceValue === "number" ? balanceValue.toFixed(2) : "0.00",
        user: w.user ?? w.userid ?? null,
      };
    });
  }

  const handleWalletSelect = (walletId) => {
    setSelectedWalletId(walletId);
  };

  const loadWallets = async () => {
    if (!token) {
      setLoadingWallets(false);
      return;
    }

    try {
      setLoadingWallets(true);
      const response = await fetch("http://localhost:3001/api/wallet", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Error al cargar wallets");
      }
      
      const walletsData = await response.json();
      console.log("Wallets data:", walletsData); 
      
      setWallets(walletsData);

      if (walletsData.length > 0 && !selectedWalletId) {
        const normalizedWallets = normalizeWallets(walletsData);
        if (normalizedWallets.length > 0) {
          setSelectedWalletId(normalizedWallets[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading wallets:", error);
    } finally {
      setLoadingWallets(false);
    }
  };

  useEffect(() => {
    if (token) {
      console.log("Cargando wallets...");
      loadWallets();
    } else {
      setWallets([]);
      setLoadingWallets(false);
    }
  }, [token]);

  const safeWallets = normalizeWallets(wallets);

  return (
    <>
      <WalletSelector
        selectedWalletId={selectedWalletId}
        loading={loadingWallets}
        safeWallets={safeWallets}
      />
      
      <div>
        <label className={styles.label}> Wallet:</label>
        <select
          value={selectedWalletId || ""}
          onChange={(e) => handleWalletSelect(parseInt(e.target.value))}
          className={styles.select}
          disabled={loadingWallets || safeWallets.length === 0}
        >
          <option value="">Selecciona una wallet</option>
          {safeWallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name} - ${wallet.balance || "0.00"}
            </option>
          ))}
        </select>
        {loadingWallets && <span className={styles.loadingText}>Cargando wallets...</span>}
        {!loadingWallets && safeWallets.length === 0 && (
          <span className={styles.noWalletsText}>No hay wallets disponibles</span>
        )}
      </div>
    </>
  );
};

export default WalletLoading;