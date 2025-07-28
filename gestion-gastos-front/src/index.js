import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./Contexts/authContext/index.jsx";
import App from "./App.jsx";
import reportWebVitals from "./reportWebVitals.js";
import { CategoryForm } from './components/CategoryForm/CategoryForm.js';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <div>
        <App />
      </div>
    </AuthProvider>
    <CategoryForm />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
