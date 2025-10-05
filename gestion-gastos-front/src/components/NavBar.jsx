import { useNavigate } from "react-router-dom";
import { fbSignOut } from "../Firebase/auth";
import { AuthContext } from "../Contexts/FBauthContext";
import { BiLogOut } from 'react-icons/bi';
import { FiHome } from 'react-icons/fi';
import styles from './NavBar.module.css';

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <h1 className = {styles.title}
        onClick={() => navigate("/")}
        >
        GG - Gestion de Gastos
      </h1>
      <nav className= {styles.navbar}>
        <button className = {styles.homeicon} onClick={() => navigate("/Main")}><FiHome/></button>
        <AuthContext.Consumer>
          {({ value }) => (
            <>
            <div>
              { value.user && <span> Welcome, {value.user.email}</span> }
            </div>
            <div>
              {value.user && (
                  <button className = {styles.signout} 
                    onClick={() => {
                      fbSignOut();
                      navigate("/home");
                    }}
                  ><BiLogOut/></button>
                )}
            </div>
            <div>
              {!value.user && (
                <button onClick={() => navigate("/login")}>Sign In</button>
              )}
            </div>
            </>
          )}
        </AuthContext.Consumer>
      </nav>
      <hr></hr>
    </div>
  );
};
export default NavBar;
