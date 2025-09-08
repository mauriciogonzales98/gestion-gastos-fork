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

export const fbEmailPasswordSignUp = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const fbCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const fbGoogleSignUp = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

export const fbPasswordReset = (email) => {
  return auth.sendPasswordResetEmail(email);
};

export const fbPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const fbSendPasswordResetEmail = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const fbSendEmailVerification = () => {
  return auth.currentUser.sendEmailVerification();
};

export const fbSignOut = () => {
  return auth.signOut();
};

export const fbDeleteUser = async (user, email, password) => {
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
