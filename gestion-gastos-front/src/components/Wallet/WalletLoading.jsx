import styles from "./WalletSelector.module.css";
import { useState } from "react";
import { useEffect } from "react";
import WalletSelector from "./WalletSelector";
const WalletLoading = ({ token, selectedWalletId, setSelectedWalletId }) => {
  const [wallets, setWallets] = useState([]);
  const handleWalletSelect = (walletId) => {
    setSelectedWalletId(walletId);
  };

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
      const spend =
        typeof w.spend === "number" ? w.spend.toFixed(2) : w.spend ?? "0.00";
      const income =
        typeof w.income === "number" ? w.income.toFixed(2) : w.income ?? "0.00";

      const balance =
        w.balance ??
        Number(w.income ?? 0) - Number(w.spend ?? 0) ??
        Number(income) - Number(spend) ??
        "0.00";

      return {
        id: Number(id),
        name,
        coin,
        spend,
        income,
        balance:
          typeof balance === "number" ? balance.toFixed(2) : String(balance),
        user: w.user ?? w.userid ?? null,
      };
    });
  }
  const safeWallets = normalizeWallets(wallets);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const loadWallets = async () => {
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
      //DEBUG
      console.log(walletsData);
      setWallets(walletsData);

      if (walletsData.length > 0 && !selectedWalletId) {
        //DEBUG
        setSelectedWalletId(walletsData[0].id);
        return walletsData;
      }
    } catch (error) {
      console.error("Error loading wallets:", error);
    } finally {
      setLoadingWallets(false);
    }
  };
  // si el usuario, la wallet o el session token cambian, carga las wallets
  useEffect(() => {
    // Si hay un usuario logueado y autenticado
    if (token) {
      // carga todas las wallets del usuario
      console.log("cargando wallets");
      loadWallets();
      console.log(wallets);
    }
  }, [token]);
  return (
    <>
      <WalletSelector
        selectedWalletId={selectedWalletId}
        loading={loadingWallets}
        safeWallets={safeWallets}
      />
      <div>
        <label className={styles.label}>Seleccionar Wallet:</label>
        <select
          value={selectedWalletId || ""}
          onChange={(e) => handleWalletSelect(parseInt(e.target.value))}
          className={styles.select}
        >
          <option value="">Selecciona una wallet</option>
          {safeWallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name} - ${wallet.balance || "0.00"}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};
export default WalletLoading;
