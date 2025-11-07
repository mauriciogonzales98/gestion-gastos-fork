import React from "react";
import Login from "../Login/Login.jsx";
import Home from "./Home.jsx";
import styles from "./HomeWithLogin.module.css";

const HomeWithLogin = () => {
  return (
    <div className={styles.splitLayout}>
      <div className={styles.leftPanel}>
        <Login />
      </div>
      <div className={styles.rightPanel}>
        <Home />
      </div>
    </div>
  );
};

export default HomeWithLogin;