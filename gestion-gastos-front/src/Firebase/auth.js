import { auth } from "./Firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  updatePassword,
} from "firebase/auth";

export const doEmailPasswordSignUp = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doGoogleSignUp = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

export const doPasswordReset = (email) => {
  return auth.sendPasswordResetEmail(email);
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  return auth.currentUser.sendEmailVerification();
};

export const doSignOut = () => {
  return auth.signOut();
};
