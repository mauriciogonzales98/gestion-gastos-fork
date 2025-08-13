import { auth } from "./Firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  updatePassword,
  signInWithPopup,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export const doEmailPasswordSignUp = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doCreateUserWithEmailAndPassword = async (email, password) => {
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

export const doSendPasswordResetEmail = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const doSendEmailVerification = () => {
  return auth.currentUser.sendEmailVerification();
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doDeleteUser = async (user, email, password) => {
  const credential = EmailAuthProvider.credential(email, password);
  await reauthenticateWithCredential(user, credential);
  await deleteUser(user)
    .then(() => {
      console.log("FB Auth: User deleted");
    })
    .catch((error) => {
      console.log("FB Auth: Error deleting user:", error);
    });
};
