import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/authContext/index.jsx";
import { AuthContext } from "../Contexts/authContext/index.jsx";
const Main = () => {
  const navigate = useNavigate();
  return (
    <>
      <AuthContext.Consumer>{({ value }) => <></>}</AuthContext.Consumer>
      <button onClick={() => navigate("/")}>HOME</button>
    </>
  );
};
export default Main;
