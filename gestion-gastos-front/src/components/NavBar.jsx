import { useNavigate } from "react-router-dom";
import { doSignOut } from "../Firebase/auth";
import { AuthContext } from "../Contexts/authContext";

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
                    doSignOut();
                    navigate("/home");
                  }}
                >
                  Sign Out
                </button>
              )}
              {!value.user && (
                <button onClick={() => navigate("/login")}>Sign In</button>
              )}
            </>
          )}
        </AuthContext.Consumer>
      </nav>
      <hr></hr>
    </>
  );
};
export default NavBar;
