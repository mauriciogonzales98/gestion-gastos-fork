// //imports
// import { useState } from "react";
// import { fbUpdateEmail } from "../../Firebase/auth.js";
// import {
//   getAuth,
//   EmailAuthProvider,
//   reauthenticateWithCredential,
// } from "firebase/auth";
// import Form from "react-bootstrap/form";

// const ChangeEmail = ({
//   setIsChangingEmail,
//   errorMessage,
//   setErrorMessage,
//   onSuccess,
//   onCancel,
// }) => {
//   //Estado Local

//   const [isChanging, setIsChanging] = useState(false);
//   const [isCheckingEmail, setIsCheckingEmail] = useState(false);

//   const auth = getAuth();
//   const user = auth.currentUser;

//   const handleChange = async (e) => {
//     e.preventDefault();
//     setIsChanging(true);
//     setErrorMessage("");

//     //Obtiene datos del formulario y los transforma en un objeto
//     const formData = new FormData(e.target);
//     const payload = Object.fromEntries(formData);
//     const needsRollback = false;

//     // Función que verifica la unicidad del email nuevo, para no conflictuar con otras cuentas.
//     const verifyUniqueEmail = async (email) => {
//       setIsCheckingEmail(true);
//       try {
//         const token = await user.getIdToken();

//         const response = await fetch(
//           `http://localhost:3001/api/user/${encodeURIComponent(email)}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (response.status === 404) {
//           setEmailAvailable(true);
//           setErrorMessage("");
//           return;
//         }

//         if (response.status === 200) {
//           setEmailAvailable(false);
//           setErrorMessage("Este email ya está en uso por otra cuenta.");
//           return;
//         }

//         if (!response.ok) {
//           throw new Error("Error verificando email");
//         }
//       } catch (err) {
//         console.error("Error verificando email:", err);
//         setEmailAvailable(false);

//         // No mostrar error por problemas de red temporales
//         if (
//           err.message.includes("Network") ||
//           err.message.includes("Failed to fetch")
//         ) {
//           setErrorMessage("");
//         }
//         return;
//       }
//     };
//     const rollbackEmailChange = async (oldEmail) => {
//       try {
//         response = await fetch(`http://localhost:3001/api/user`, {
//           method: "PATCH",
//           mode: "cors",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${user.getIdToken()}`,
//           },
//           body: JSON.stringify({ email: payload.newEmail }),
//         });
//       } catch (rollbackError) {
//         setErrorMessage("Ha ocurrido lo peor... ");
//         console.log(
//           "El email del usuario se desincronizó entre el BE y FB. Todo mal."
//         );
//       }
//     };

//     /////////////////////////////////////////////////////////////////////////////////////////////////////

//     // VALIDACIONES

//     // Verifica que el email nuevo no sea igual al anterior
//     if (payload.oldEmail === payload.newEmail) {
//       setErrorMessage("El nuevo email no puede ser igual que el anterior");
//       return;
//     }
//     // Verifica que el email viejo sea correcto. ¿Hace falta?
//     if (payload.oldEmail != user.email) {
//       setErrorMessage("Su email actual no coincide");
//       return;
//     }
//     try {
//       // Reautientica al usuario
//       const credential = EmailAuthProvider.credential(
//         user.email,
//         payload.password
//       );
//       await reauthenticateWithCredential(user, credential);
//     } catch (reauthError) {
//       setErrorMessage("Error autenticando su usuario");
//       console.log("Error reautenticando", reauthError);
//       return;
//     }

//     try {
//       // verifica la unicidad del email nuevo.
//       await verifyUniqueEmail(payload.newEmail);
//     } catch (uniqueEmailError) {
//       setErrorMessage("Ya existe un usuario registrado con ese email");
//       console.error("FE: Error cambiando email:", reauthError);
//       return;
//     }

//     //CAMBIO
//     //Cambio en BE
//     response = await fetch(`http://localhost:3001/api/user`, {
//       method: "PATCH",
//       mode: "cors",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${user.getIdToken()}`,
//       },
//       body: JSON.stringify({ email: payload.newEmail }),
//     });
//     if (!response.ok) {
//       setErrorMessage("Error del servidor modificando el email");
//       //DEBUG
//       console.log("Error en BE al modificar email");
//       return;
//     }
//     try {
//       //Cambio en FB
//       await fbUpdateEmail(payload.newEmail);
//     } catch (err) {
//       setErrorMessage("Error del servidor modificando el email");
//       //DEBUG
//       needsRollback = true;
//       console.log("Error en FB al modificar email. Iniciando rollback");
//       return;
//     }

//     if (needsRollback) {
//       await rollbackEmailChange(payload.oldEmail);
//     }
//   };

//   // RETURN JSX
//   return (
//     <>
//       {errorMessage && <div>{errorMessage}</div>}

//       <form onSubmit={handleChange}>
//         <label>Email Actual:</label>
//         <Form.Control type="email" id="oldEmail" name="newEmail" required />
//         <label>Nuevo Email:</label>{" "}
//         <Form.Control type="email" id="newEmail" name="newEmail" required />
//         <label> Contraseña</label>
//         <Form.Control type="password" id="password" name="password" required />
//         <button type="submit">Cambiar Email</button>
//       </form>

//       <button type="button" onClick={onCancel} disabled={isChanging}>
//         Cancelar
//       </button>
//     </>
//   );
// };

// export default ChangeEmail;
