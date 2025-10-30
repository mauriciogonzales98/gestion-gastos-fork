import { useNavigate } from "react-router-dom";
import { fbSignOut } from "../Firebase/auth";
import { AuthContext, useAuth } from "../Contexts/fbAuthContext";
import { BiCategory, BiLogOut, BiSolidUserAccount } from "react-icons/bi";
import { FiHome } from "react-icons/fi";
import styles from "./NavBar.module.css";

const NavBar = () => {
  const navigate = useNavigate();

  const ClickHandler = () => {
    console.log("Handled");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title} onClick={() => navigate("/")}>
        GG - Gestion de Gastos
      </h1>
      <nav className={styles.navbar}>
        <AuthContext.Consumer>
          {(value) => (
            <>
              <div>
                {" "}
                {/* Muestra el usuario de FB */}
                {value.user && (
                  <span> Welcome, {value.user.displayName.split(" ")[0]}</span>
                )}{" "}
              </div>

              <button className={styles.homeicon} onClick={ClickHandler}>
                <FiHome />
              </button>

              <div>
                {value.user && (
                  <button
                    className={styles.signout}
                    onClick={() => {
                      navigate("/categories");
                    }}
                  >
                    <BiCategory />
                  </button>
                )}
              </div>

              <div>
                {value.user && (
                  <button
                    className={styles.homeicon}
                    onClick={() => {
                      navigate("/Profile");
                    }}
                  >
                    <BiSolidUserAccount />
                  </button>
                )}
              </div>

              {/* <div>
              {!value.user && (
                <button onClick={() => navigate("/login")}>Sign In</button>
              )}
            </div> */}
            </>
          )}
        </AuthContext.Consumer>
      </nav>
    </div>
  );
};
export default NavBar;
