import { auth } from "../../Firebase/Firebase.js";
import { useContext, useState, useEffect, createContext } from "react";
import { onAuthStateChanged } from "firebase/auth";

//This context provides the authentication state and user information for FIREBASE AUTH
export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }) {
  // States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  // initializeUser is called whenever the auth state of Firebase changes (when a user logs in or out, when they register, etc.)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  function initializeUser(user) {
    if (user) {
      setUser({ ...user });
      user;
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
      {!loading && children}
    </AuthContext.Provider>
  );
}
