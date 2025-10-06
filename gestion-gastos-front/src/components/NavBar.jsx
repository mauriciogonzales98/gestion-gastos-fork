import { useNavigate } from "react-router-dom";
import { fbSignOut } from "../Firebase/auth";
import { AuthContext } from "../Contexts/FBauthContext";

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          textWrap: "wrap",
          color: "lime",
          cursor: "pointer",
        }}
      >
        GG- Gestion de Gastos
      </h1>
      <nav>
        <button onClick={() => navigate("/Main")}>Go to Main</button>
        <AuthContext.Consumer>
          {({ value }) => (
            <>
              {value.user && (
                <button
                  onClick={() => {
                    fbSignOut();
                    navigate("/home");
                  }}
                >
                  Sign Out
                </button>
              )}
              {!value.user && (
                <button onClick={() => navigate("/login")}>Sign In</button>
              )}
              {value.user && <span>Hola, {value.user.email}</span>}
            </>
          )}
        </AuthContext.Consumer>
      </nav>
      <hr></hr>
    </>
  );
};
export default NavBar;
