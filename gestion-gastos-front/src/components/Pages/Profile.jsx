import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useToken } from "../../Contexts/fbTokenContext/TokenContext.jsx";
import { AuthContext } from "../../Contexts/fbAuthContext/index.jsx";
import { useNavigate } from "react-router-dom";

import DeleteAccount from "../User/userDelete/UserDeleteManager.jsx";
import { PasswordInput } from "../Login/PasswordInputs.jsx";
import ChangePassword from "../User/userUpdate/PasswordChangeManager.jsx";
import ChangeEmail from "../User/userUpdate/EmailChangeManager.jsx";
import FullNameChange from "../User/userUpdate/FullNameChangeManager.jsx";
import MercadoPagoSync from "../User/userMercadoPago/MercadoPagoSync.jsx";
import styles from "./Profile.module.css";

const Profile = () => {
  const currentUser = getAuth().currentUser;
  const [isChangingFullName, setIsChangingFullName] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isGoogleUser = currentUser?.providerData.some(
    (provider) => provider.providerId === "google.com"
  );
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        
        <AuthContext.Consumer>
          {(value) => (
            <>
              {/* Sección Mercado Pago */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Sincronización con Mercado Pago</h2>
                <MercadoPagoSync />
              </div>

              {/* Sección Cambio de Nombre */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Cambiar Nombre y Apellido</h2>
                <div className={styles.buttonGroup}>
                  <button
                    onClick={() => {
                      setErrorMessage("");
                      setIsChangingFullName(true);
                    }}
                    className={styles.button}
                  >
                    Cambiar Nombre y Apellido
                  </button>
                  
                  {isChangingFullName && (
                    <div className={styles.formContainer}>
                      <FullNameChange
                        onCancel={() => setIsChangingFullName(false)}
                        userId={currentUser.uid}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sección Cambio de Contraseña */}
              {value.user && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Cambiar Contraseña</h2>
                  <div className={styles.buttonGroup}>
                    {!isChangingPassword && (
                      <>
                        {isGoogleUser && (
                          <div className={styles.googleWarning}>
                            Los usuarios de Google no necesitan modificar su contraseña
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (isGoogleUser) {
                              setErrorMessage("Los usuarios de Google no necesitan modificar su contraseña");
                              return;
                            }
                            setErrorMessage("");
                            setIsChangingPassword(true);
                          }}
                          className={styles.button}
                          disabled={isGoogleUser}
                        >
                          Cambiar Contraseña
                        </button>
                      </>
                    )}
                    
                    {isChangingPassword && (
                      <div className={styles.formContainer}>
                        <ChangePassword
                          setIsChangingPassword={setIsChangingPassword}
                          errorMessage={errorMessage}
                          setErrorMessage={setErrorMessage}
                          onCancel={() => setIsChangingPassword(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sección Borrado de Cuenta */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Zona de peligro</h2>
                <div className={styles.buttonGroup}>
                  <button
                    onClick={() => {
                      setErrorMessage("");
                      setIsDeletingAccount(true);
                    }}
                    className={`${styles.button} ${styles.dangerButton}`}
                  >
                    Borrar Cuenta
                  </button>
                  
                  {isDeletingAccount && (
                    <div className={styles.formContainer}>
                      <DeleteAccount
                        setIsDeletingAccount={setIsDeletingAccount}
                        errorMessage={errorMessage}
                        setErrorMessage={setErrorMessage}
                        onCancel={() => setIsDeletingAccount(false)}
                        isGoogleUser={isGoogleUser}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </AuthContext.Consumer>
      </div>
    </div>
  );
};

export default Profile;