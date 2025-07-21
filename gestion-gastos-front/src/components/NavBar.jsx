import { useNavigate } from "react-router-dom";
import { doSignOut } from "../Firebase/auth";

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
        userSignedIn
        <button
          onClick={() => {
            doSignOut().then(() => {
              navigate("/login");
            });
          }}
        >
          Sign Out
        </button>
      </nav>
      <hr></hr>
    </>
  );
};
export default NavBar;
