import { FIREBASE_CONFIG, FIREBASE_PRODUCTS_COLLECTION, hasFirebaseConfig } from './firebase-config.js';

const WA_NUMBER = '5491156592963';
const fallbackProducts = [];
const fallbackDesigns = [];
const FIREBASE_SDK_VERSION = '10.12.5';

const resourceStatus = {
  products: { source: 'idle', error: null },
  designs: { source: 'idle', error: null }
};

const firebaseState = {
  app: null,
  db: null,
  initPromise: null
};

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function setResourceStatus(resourceName, source, error = null) {
  resourceStatus[resourceName] = {
    source,
    error: error && error.message ? error.message : error
  };
}

async function loadJson(url, fallbackData, resourceName) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se pudo cargar ${url} (${response.status})`);

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`Respuesta inválida en ${url}`);

    setResourceStatus(resourceName, 'json', null);
    return cloneData(data);
  } catch (error) {
    console.warn(`[Retro Remeras] fallback para ${resourceName}:`, error);
    setResourceStatus(resourceName, 'fallback', error);
    return cloneData(fallbackData);
  }
}

async function getFirebaseDb() {
  if (!hasFirebaseConfig()) {
    throw new Error('Firebase no está configurado. Completar js/firebase-config.js.');
  }

  if (firebaseState.db) return firebaseState.db;

  if (!firebaseState.initPromise) {
    firebaseState.initPromise = Promise.all([
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`)
    ]).then(([appModule, firestoreModule]) => {
      firebaseState.app = appModule.initializeApp(FIREBASE_CONFIG);
      firebaseState.db = firestoreModule.getFirestore(firebaseState.app);
      return firebaseState.db;
    });
  }

  return firebaseState.initPromise;
}

function normalizeProduct(rawProduct, documentId) {
  const product = rawProduct && typeof rawProduct === 'object' ? rawProduct : {};
  const activo = product.activo ?? product.disponible ?? true;

  return {
    ...product,
    id: product.id ?? documentId,
    activo: Boolean(activo),
    disponible: Boolean(product.disponible ?? activo),
    destacado: Boolean(product.destacado),
    precio: Number(product.precio) || 0,
    imagen: product.imagen || product.imagenPrincipal || '',
    imagenesPorColor: product.imagenesPorColor || {},
    nombre: product.nombre || 'Producto sin nombre',
    categoria: product.categoria || 'Variados',
    descripcion: product.descripcion || ''
  };
}

function sortProducts(products) {
  return [...products].sort((a, b) => {
    const orderA = Number.isFinite(Number(a.orden)) ? Number(a.orden) : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(Number(b.orden)) ? Number(b.orden) : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
  });
}

async function loadProductsFromFirebase() {
  const db = await getFirebaseDb();
  const firestoreModule = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`);
  const productsRef = firestoreModule.collection(db, FIREBASE_PRODUCTS_COLLECTION);
  const productsQuery = firestoreModule.query(productsRef, firestoreModule.where('activo', '==', true));
  const snapshot = await firestoreModule.getDocs(productsQuery);

  const products = snapshot.docs
    .map((doc) => normalizeProduct(doc.data(), doc.id))
    .filter((product) => product.activo && product.disponible);

  if (!products.length) {
    throw new Error('Firebase no devolvió productos activos.');
  }

  setResourceStatus('products', 'firebase', null);
  return sortProducts(products);
}

export async function loadProducts() {
  try {
    return await loadProductsFromFirebase();
  } catch (firebaseError) {
    console.warn('[Retro Remeras] No se pudo cargar productos desde Firebase. Se usa products.json:', firebaseError);

    const products = await loadJson('data/products.json', fallbackProducts, 'products');

    if (getDataStatus('products').source !== 'fallback') {
      setResourceStatus('products', 'json-fallback', firebaseError);
    }

    return products;
  }
}

export async function loadDesigns() {
  return loadJson('data/designs.json', fallbackDesigns, 'designs');
}

export function clearDataCache() {}

export function getDataStatus(resourceName) {
  if (!resourceStatus[resourceName]) return { source: 'idle', error: null };
  return { ...resourceStatus[resourceName] };
}

export function renderDataNotice(target, resourceName, message) {
  if (!target) return;

  const existing = target.querySelector('[data-data-notice]');
  if (existing) existing.remove();

  const status = getDataStatus(resourceName);
  if (status.source !== 'fallback') return;

  const notice = document.createElement('div');
  notice.className = 'notice data-notice';
  notice.setAttribute('data-data-notice', 'true');
  notice.textContent = message || 'No se pudieron cargar los datos remotos.';
  target.prepend(notice);
}

export function formatPrice(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(number);
}

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function safeUrl(value, fallback = '#') {
  const url = String(value || '').trim();
  if (!url) return fallback;
  if (/^(https?:|mailto:|tel:|assets\/|data\/|\.\/|\.\.\/|[\w-]+\.html)/i.test(url)) return url;
  return fallback;
}

export function getProductUrl(productId) {
  return `producto.html?id=${encodeURIComponent(String(productId ?? ''))}`;
}

export function createWhatsAppLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message || '')}`;
}
