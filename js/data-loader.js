const WA_NUMBER = '5491156592963';
const CACHE_PREFIX = 'retro_remeras_cache_v1';

const fallbackProducts = [];

const fallbackDesigns = [];

const resourceStatus = {
  products: { source: 'idle', error: null },
  designs: { source: 'idle', error: null }
};

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function getCacheKey(resourceName) {
  return `${CACHE_PREFIX}:${resourceName}`;
}

function readCachedJson(resourceName) {
  try {
    const raw = sessionStorage.getItem(getCacheKey(resourceName));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
}

function writeCachedJson(resourceName, data) {
  try {
    sessionStorage.setItem(getCacheKey(resourceName), JSON.stringify(data));
  } catch (error) {
    // no-op
  }
}

async function loadJson(url, fallbackData, resourceName) {
  const cached = readCachedJson(resourceName);

  if (cached) {
    resourceStatus[resourceName] = { source: 'cache', error: null };
    return cloneData(cached);
  }

  try {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${url} (${response.status})`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(`Respuesta inválida en ${url}`);
    }

    writeCachedJson(resourceName, data);
    resourceStatus[resourceName] = { source: 'network', error: null };

    return cloneData(data);
  } catch (error) {
    console.warn(`[Retro Remeras] fallback para ${resourceName}:`, error);
    resourceStatus[resourceName] = {
      source: 'fallback',
      error: error && error.message ? error.message : 'Error desconocido'
    };

    return cloneData(fallbackData);
  }
}

export async function loadProducts() {
  return loadJson('data/products.json', fallbackProducts, 'products');
}

export async function loadDesigns() {
  return loadJson('data/designs.json', fallbackDesigns, 'designs');
}

export function clearDataCache() {
  try {
    sessionStorage.removeItem(getCacheKey('products'));
    sessionStorage.removeItem(getCacheKey('designs'));
  } catch (error) {
    // no-op
  }
}

export function getDataStatus(resourceName) {
  if (!resourceStatus[resourceName]) {
    return { source: 'idle', error: null };
  }

  return {
    source: resourceStatus[resourceName].source,
    error: resourceStatus[resourceName].error
  };
}

export function renderDataNotice(target, resourceName, message) {
  if (!target) return;

  const existing = target.querySelector('[data-data-notice]');
  if (existing) {
    existing.remove();
  }

  const status = getDataStatus(resourceName);

  if (status.source !== 'fallback') return;

  const notice = document.createElement('div');
  notice.className = 'notice data-notice';
  notice.setAttribute('data-data-notice', 'true');
  notice.textContent =
    message || 'No se pudieron cargar los datos remotos. Estamos mostrando contenido de respaldo.';

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

export function createWhatsAppLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message || '')}`;
}