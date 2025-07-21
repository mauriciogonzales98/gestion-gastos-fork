import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArDrL2eQ_U6cWkXekmxsi0f2FxIb6xEOg",

  authDomain: "gestion-gastos-f2d5f.firebaseapp.com",

  projectId: "gestion-gastos-f2d5f",

  storageBucket: "gestion-gastos-f2d5f.firebasestorage.app.com",

  messagingSenderId: "1061304688994",

  appId: "1:1061304688994:web:fbb8e0128bc90d027c8c3b",
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
