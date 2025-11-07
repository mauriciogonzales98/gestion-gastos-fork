// utils/pkce.utils.ts
import crypto from 'crypto';

// Almacenamiento temporal en memoria (para desarrollo)
const pkceStore = new Map();

export function generatePKCE(userId: string) {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Guardar con userId como clave
  pkceStore.set(userId, codeVerifier);
  
  return { codeVerifier, codeChallenge };
}

export function getCodeVerifier(userId: string) {
  return pkceStore.get(userId);
}

export function deleteCodeVerifier(userId: string) {
  pkceStore.delete(userId);
}