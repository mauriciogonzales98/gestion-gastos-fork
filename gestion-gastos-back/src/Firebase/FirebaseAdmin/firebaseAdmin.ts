// backend/Firebase/FirebaseAdmin/firebaseAdmin.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!admin.apps.length) {
  try {
    // Load service account from JSON file
    const serviceAccountPath = join(
      __dirname,
      "../../../firebase-service-account.json"
    );
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log(
      " Firebase Admin initialized successfully from service account file"
    );
  } catch (error) {
    console.error(" Firebase Admin initialization failed:", error);

    // Fallback to environment variables if file doesn't exist
    console.log(" Trying environment variables as fallback...");
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      console.log(" Firebase Admin initialized from environment variables");
    } else {
      throw error;
    }
  }
}

export default admin;
