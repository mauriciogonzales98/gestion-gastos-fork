import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/authContext/index.jsx";
import { AuthContext } from "../Contexts/authContext/index.jsx";
const Main = () => {
  const navigate = useNavigate();
  return (
    <>
      <AuthContext.Consumer>
        {({ value }) => (
          <>
            <h1> Su email es {value.user ? value.user.email : "Invitado"}</h1>
            <h2> Su ID es {value.user ? value.user.uid : "Invitado"}</h2>
            <h2>
              {" "}
              Su nombre es {value.user.displayName} y su apellido es{" "}
              {value.user.displaySurname}
            </h2>
          </>
        )}
      </AuthContext.Consumer>
      <button onClick={() => navigate("/")}>HOME</button>
    </>
  );
};
export default Main;
