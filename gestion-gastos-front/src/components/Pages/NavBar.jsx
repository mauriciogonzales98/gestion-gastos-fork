// NavBar.jsx
import { useNavigate } from "react-router-dom";
import { fbSignOut } from "../../Firebase/auth";
import { AuthContext, useAuth } from "../../Contexts/fbAuthContext";
import {
  BiCategory,
  BiDollarCircle,
  BiLogOut,
  BiSolidUserAccount,
  BiTag,
  BiHome,
  BiWallet,
} from "react-icons/bi";
import { memo, useCallback } from "react"; // ✅ Importamos memo y useCallback
import styles from "./NavBar.module.css";

// ✅ Memoizamos el componente para evitar re-renders innecesarios
const NavBar = memo(() => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  // ✅ useCallback para funciones de navegación
  const handleHomeClick = useCallback(() => {
    if (userLoggedIn) {
      navigate("/main");
    } else {
      navigate("/");
    }
  }, [userLoggedIn, navigate]);

  const handleWalletClick = useCallback(() => {
    navigate("/create-wallet");
  }, [navigate]);

  const handleCategoriesClick = useCallback(() => {
    navigate("/categories");
  }, [navigate]);

  const handleTagsClick = useCallback(() => {
    navigate("/tags");
  }, [navigate]);

  const handleProfileClick = useCallback(() => {
    navigate("/Profile");
  }, [navigate]);

  const handleSignOut = useCallback(() => {
    fbSignOut();
    navigate("/");
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className={styles.container}>
      {/* Logo SIN recuadro */}
      <img
        src="/ggs.png"
        alt="Gestión de Gastos"
        className={styles.logo}
        onClick={handleLogoClick}
      />
      
      <nav className={styles.navbar}>
        <AuthContext.Consumer>
          {(value) => (
            <>
              {/* WELCOME MESSAGE */}
              {value.user && (
                <div className={styles.welcome}>
                  Bienvenido,<br/>{value.user.email}
                </div>
              )}
              
              {/* HOME */}
              <div className={styles.tooltip}>
                <button className={styles.navButton} onClick={handleHomeClick}>
                  <BiHome className={styles.icon} />
                  <span>Inicio</span>
                </button>
                <div className={styles.tooltipText}>Inicio</div>
              </div>

              {/* WALLETS */}
              {value.user && (
                <div className={styles.tooltip}>
                  <button
                    className={styles.navButton}
                    onClick={handleWalletClick}
                  >
                    <BiWallet className={styles.icon} />
                    <span>Carteras</span>
                  </button>
                  <div className={styles.tooltipText}>Carteras</div>
                </div>
              )}

              {/* CATEGORIES */}
              {value.user && (
                <div className={styles.tooltip}>
                  <button
                    className={styles.navButton}
                    onClick={handleCategoriesClick}
                  >
                    <BiCategory className={styles.icon} />
                    <span>Categorías</span>
                  </button>
                  <div className={styles.tooltipText}>Categorías</div>
                </div>
              )}

              {/* TAGS */}
              {value.user && (
                <div className={styles.tooltip}>
                  <button
                    className={styles.navButton}
                    onClick={handleTagsClick}
                  >
                    <BiTag className={styles.icon} />
                    <span>Etiquetas</span>
                  </button>
                  <div className={styles.tooltipText}>Etiquetas</div>
                </div>
              )}

              {/* PROFILE */}
              {value.user && (
                <div className={styles.tooltip}>
                  <button
                    className={styles.navButton}
                    onClick={handleProfileClick}
                  >
                    <BiSolidUserAccount className={styles.icon} />
                    <span>Perfil</span>
                  </button>
                  <div className={styles.tooltipText}>Perfil</div>
                </div>
              )}

              {/* SIGN OUT */}
              {value.user && (
                <div className={styles.tooltip}>
                  <button
                    className={styles.signout}
                    onClick={handleSignOut}
                  >
                    <BiLogOut className={styles.icon} />
                    <span>Cerrar Sesión</span>
                  </button>
                  <div className={styles.tooltipText}>Cerrar Sesión</div>
                </div>
              )}
            </>
          )}
        </AuthContext.Consumer>
      </nav>
    </div>
  );
});

export default NavBar;