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
import styles from "./NavBar.module.css";
// The logo lives in the public folder. Refer to it with an absolute public path.

const NavBar = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  const ClickHandler = () => {
    if (userLoggedIn) {
      navigate("/main");
    } else navigate("/");
  };

  return (
    <div className={styles.container}>
      {/* Logo */}
      <img
        src="/ggs.png"
        alt="Gestión de Gastos"
        className={styles.logo}
        onClick={() => navigate("/")}
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
                <button className={styles.navButton} onClick={ClickHandler}>
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
                    onClick={() => navigate("/create-wallet")}
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
                    onClick={() => navigate("/categories")}
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
                    onClick={() => navigate("/tags")}
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
                    onClick={() => navigate("/Profile")}
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
                    onClick={() => {
                      fbSignOut();
                      navigate("/");
                    }}
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
};

export default NavBar;