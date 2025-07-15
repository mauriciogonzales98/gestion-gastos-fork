import React from "react";

function Prueba({ onLoginClick }) {
  return (
    <div>
      <h1>Bienvenido a GG</h1>
      <body>
        <p>En esta aplicación podrás gestionar tus gastos de forma sencilla </p>
      </body>
      <button onClick={onLoginClick}>Iniciar Sesión</button>
      <button>Registrarse</button>
    </div>
  );
}
export default Prueba;
