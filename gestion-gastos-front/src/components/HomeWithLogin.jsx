import React from 'react';
import Login from './Registration/Login.jsx';
import Home from './Home.jsx';
// import '../App.css'
import './Home.module.css';
import './Registration/Login.module.css';

const HomeWithLogin = () => {
  return (
    <div className="split-layout">
      <div className="left-panel">
        <Login />
      </div>
      <div className="right-panel">
        <Home />
      </div>
    </div>
  );
};

export default HomeWithLogin;