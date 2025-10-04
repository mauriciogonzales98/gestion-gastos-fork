import serviceAccount from "./gestion-gastos-f2d5f-firebase-adminsdk-fbsvc-b92cae1d6d.json";
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const fbAdmin = admin;
export default fbAdmin;
