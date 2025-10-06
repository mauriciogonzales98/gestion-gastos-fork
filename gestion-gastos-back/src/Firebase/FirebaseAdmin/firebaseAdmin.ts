// import serviceAccountJSON from "./gestion-gastos-f2d5f-firebase-adminsdk-fbsvc-b92cae1d6d.json";
import "dotenv/config";
import admin, { ServiceAccount } from "firebase-admin";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT!;
const parsed = JSON.parse(raw);
console.log("PRE_________________________");
console.log(parsed.private_key);
parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");

console.log("POST_________________________");
console.log(parsed.private_key);
admin.initializeApp({
  credential: admin.credential.cert(parsed),
});

const fbAdmin = admin;
export default fbAdmin;
// abcdefghi
