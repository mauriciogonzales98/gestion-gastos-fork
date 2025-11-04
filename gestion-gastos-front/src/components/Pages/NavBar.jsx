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
} from "react-icons/bi";
import { FiHome, FiTag } from "react-icons/fi";
import styles from "./NavBar.module.css";

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
      <h1 className={styles.title} onClick={() => navigate("/")}>
        GG - Gestion de Gastos
      </h1>
      <nav className={styles.navbar}>
        <AuthContext.Consumer>
          {(value) => (
            <>
              {/* WELCOME MESSAGE */}
              <div>
                {" "}
                {value.user && <span> Welcome, {value.user.email}</span>}{" "}
              </div>
              {/* HOME */}
              <button className={styles.homeicon} onClick={ClickHandler}>
                <FiHome />
              </button>
              {/* CATEGORIES */}
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
              {/* TAGS */}
              <div>
                {value.user && (
                  <button
                    className={styles.signout}
                    onClick={() => {
                      navigate("/tags");
                    }}
                  >
                    <BiTag />
                  </button>
                )}
              </div>
              <div>
                <button
                  className={styles.button}
                  onClick={() => {
                    navigate("/create-wallet");
                  }}
                >
                  <BiDollarCircle />
                </button>
              </div>
              {/* PROFILE */}
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
              {/* SIGN OUT */}
              <div>
                {value.user && (
                  <button
                    className={styles.signout}
                    onClick={() => {
                      fbSignOut();
                      navigate("/");
                    }}
                  >
                    <BiLogOut />
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