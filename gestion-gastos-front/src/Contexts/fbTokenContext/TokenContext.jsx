// contexts/TokenContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
// import { useAuth } from "../fbAuthContext/index.jsx";
import { useAuth } from "../fbAuthContext";

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresca token automáticamente
  useEffect(() => {
    const refreshToken = async () => {
      if (!user) {
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Refresca el token
          const newToken = await currentUser.getIdToken(/*Refresh token*/ true);
          setToken(newToken);
          console.log(" Token refrescado");
        }
      } catch (error) {
        console.error(" Error refrescando token:", error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    refreshToken();

    // Refresca el token cada 45 minutos
    const interval = setInterval(refreshToken, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Refrescar manualmente el token
  const refreshTokenManually = async () => {
    if (!user) return null;

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const newToken = await currentUser.getIdToken(true);
        setToken(newToken);
        return newToken;
      }
    } catch (error) {
      console.error("Error refrescando token manualmente:", error);
    }
    return null;
  };

  const value = {
    token,
    loading,
    refreshToken: refreshTokenManually,
    isTokenReady: !loading && token !== null,
  };

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
};


export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken debe ser usado dentro de TokenProvider");
  }
  return context;
};
