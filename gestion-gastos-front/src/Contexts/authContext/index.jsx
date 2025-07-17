import { auth } from "../../Firebase/Firebase";
import React, { useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }) {
  // States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (user) {
      setUser({ ...user });
      setLoggedIn(true);
    } else {
      setUser(null);
      setLoggedIn(false);
    }
    setLoading(false);
  }
  const value = {
    user,
    loading,
    loggedIn,
  };
  return (
    <AuthContext.Provider value={{ value }}>
      {" "}
      {!loading && children}
    </AuthContext.Provider>
  );
}
