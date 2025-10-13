import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/FBauthContext/index.jsx";
import { AuthContext } from "../Contexts/FBauthContext/index.jsx";
import { fbDeleteUser } from "../Firebase/auth.js";
import CategoryList from "./CategoryForm/CategoryList.jsx";
import OperationForm from "./Operation/OperationForm.jsx";
import Wallet from "./Wallet/Wallet.jsx";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const userDeleteManager = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const isGoogleUser = user.providerData.some(
    (provider) => provider.providerId === "google.com"
  );
  try {
    if (!user) {
      console.error("No user is currently signed in.");
      throw new Error("No hay usuario autenticado");
    }
    let password = null;
    if (!isGoogleUser) {
      password = prompt(
        "Por favor ingresa tu contraseña para confirmar la eliminación de tu cuenta:"
      );
      console.log("la password ingresada fue: ", password);
      if (!password) {
        throw new Error("Se requiere contraseña para eliminar la cuenta");
      }
    }

    if (isGoogleUser) {
      try {
        console.log("obteniendo provider");
        const provider = new GoogleAuthProvider();
        console.log("Provider obtenido)");
        console.log("Parametros seteados correctamente");
        await reauthenticateWithPopup(user, provider);
        console.log("reautenticando...");
        console.log("Usuario de Google re-autenticado");
      } catch (error) {
        console.error("Error re-autenticando con Google:", error);
        throw new Error(
          "Necesitas re-autenticarte con Google para eliminar tu cuenta"
        );
      }
    } else {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    }

    const token = await user.getIdToken(true);

    const response = await fetch(`http://localhost:3001/api/user/${user.uid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log("usuario eliminado de la base de datos");
      await fbDeleteUser(user);
    } else {
      const errorData = await response.json();
      console.error(
        "FE: Error eliminando usuario de la base de datos:",
        errorData
      );
    }
  } catch (err) {
    console.error("FE: Error eliminando usuario:", err);
  }
};

const Main = () => {
  const navigate = useNavigate();
  const { loggedIn, user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      if (user) {
        try {
          const auth = getAuth();
          const currentUser = auth.currentUser;
          if (currentUser) {
            const userToken = await currentUser.getIdToken();
            setToken(userToken);
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
    };

    getToken();
  }, [user]);

  useEffect(() => {
    if (!loggedIn) {
      navigate("/home");
      return;
    }

    if (user && token) {
      const loadWallets = async () => {
        try {
          setLoadingWallets(true);
          const response = await fetch('http://localhost:3001/api/wallet', {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          });
          if (response.ok) {
            const walletsData = await response.json();
            setWallets(walletsData);
            
            if (walletsData.length > 0 && !selectedWalletId) {
              setSelectedWalletId(walletsData[0].id);
            }
          } else {
            throw new Error('Error al cargar wallets');
          }
        } catch (error) {
          console.error('Error loading wallets:', error);
        } finally {
          setLoadingWallets(false);
        }
      };

      loadWallets();
    }
  }, [loggedIn, navigate, user, selectedWalletId, token]);

  if(!loggedIn){
    return null;
  }

  const handleWalletSelect = (walletId) => {
    setSelectedWalletId(walletId);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Main Page - Protected Route</h1>
        {user && <p style={{ color: '#666' }}>Bienvenido, {user.email}</p>}
      </div>

      <Wallet
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onWalletSelect={handleWalletSelect}
        loading={loadingWallets}
      />

      <div style={{ display: 'flex', marginBottom: '30px', justifyContent: 'center'}}>
        <div style={ {width: '1200px',maxWidth: '100%'}}>
          <OperationForm walletId={selectedWalletId} token={token} />
        </div>
      </div>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <AuthContext.Consumer>
          {( value ) => (
            <>
              {value.user && <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>Zona de Peligro</h2>}
              {value.user && (
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                      userDeleteManager();
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  BORRAR CUENTA
                </button>
              )}
            </>
          )}
        </AuthContext.Consumer>
      </div>
    </div>
  );
};

export default Main;