/*
  Configuración pública de Firebase para Retro Remeras.

  IMPORTANTE:
  - Estos datos NO son claves privadas. En Firebase Web SDK la config del cliente es pública.
  - La seguridad real depende de Firebase Auth + Firestore Rules + Storage Rules.
  - Hasta completar estos valores, el sitio sigue usando data/products.json automáticamente.
*/

export const FIREBASE_CONFIG = {
  apiKey: 'REEMPLAZAR_API_KEY',
  authDomain: 'REEMPLAZAR_PROJECT_ID.firebaseapp.com',
  projectId: 'REEMPLAZAR_PROJECT_ID',
  storageBucket: 'REEMPLAZAR_PROJECT_ID.appspot.com',
  messagingSenderId: 'REEMPLAZAR_MESSAGING_SENDER_ID',
  appId: 'REEMPLAZAR_APP_ID'
};

export const FIREBASE_PRODUCTS_COLLECTION = 'products';

export function hasFirebaseConfig() {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.projectId &&
    !String(FIREBASE_CONFIG.apiKey).startsWith('REEMPLAZAR_') &&
    !String(FIREBASE_CONFIG.projectId).startsWith('REEMPLAZAR_')
  );
}
