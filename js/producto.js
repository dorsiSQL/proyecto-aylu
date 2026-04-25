import { loadProducts, formatPrice, createWhatsAppLink, renderDataNotice, escapeHtml, safeUrl } from './data-loader.js';
import { cart } from './cart.js';

const COLORS = [
  { name: 'Negro', swatchClass: 'swatch-dot--negro' },
  { name: 'Blanco', swatchClass: 'swatch-dot--blanco' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const FITS = [
  { key: 'regular', label: 'Regular', note: 'Calce clásico' },
  { key: 'oversize', label: 'Oversize', note: 'Más amplio y relajado' }
];

const SIZE_GUIDES = {
  regular: {
    label: 'Regular',
    src: 'assets/talles-producto/talle-regular.png',
    alt: 'Tabla de talles para remera regular'
  },
  oversize: {
    label: 'Oversize',
    src: 'assets/talles-producto/talles-oversize.png',
    alt: 'Tabla de talles para remera oversize'
  }
};

const DEFAULTS = {
  color: COLORS[0],
  size: 'M',
  fit: 'regular'
};

const state = {
  products: [],
  selectedProduct: null,
  selectedColor: DEFAULTS.color,
  selectedSize: DEFAULTS.size,
  selectedFit: DEFAULTS.fit,
  cart: cart.load()
};

document.addEventListener('DOMContentLoaded', initProductPage);

async function initProductPage() {
  try {
    state.products = await loadProducts();

    renderDataNotice(
      document.querySelector('.product-shell'),
      'products',
      'No pudimos cargar el producto remoto. Se está mostrando una versión de respaldo.'
    );

    setProductFromQuery();

    if (!state.selectedProduct) {
      renderNotFound();
      return;
    }

    renderProduct();
    renderFitSelector();
    renderSizes();
    renderColors();
    renderSizeGuide();
    renderCart();
    updateOrderLink();
    setupActions();
  } catch (error) {
    console.error('Error inicializando producto:', error);
    renderNotFound();
  }
}

/* ===============================
   PRODUCTO
=============================== */

function setProductFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  state.selectedProduct =
    state.products.find(p => String(p.id) === String(productId)) || state.products[0] || null;
}

function renderProduct() {
  const product = state.selectedProduct;
  if (!product) return;

  document.querySelector('[data-product-breadcrumb]').textContent = product.nombre;
  document.querySelector('[data-product-name]').textContent = product.nombre;
  document.querySelector('[data-product-category]').textContent = product.categoria;
  document.querySelector('[data-product-price]').textContent = formatPrice(product.precio);
  document.querySelector('[data-product-description]').textContent = product.descripcion;

  updateProductImage();
  updateProductSchema(product);
}

function updateProductSchema(product) {
  let node = document.querySelector('[data-product-schema]');
  if (!node) {
    node = document.createElement('script');
    node.type = 'application/ld+json';
    node.setAttribute('data-product-schema', 'true');
    document.head.appendChild(node);
  }

  node.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    description: product.descripcion,
    image: safeUrl(getSelectedProductImage(), ''),
    category: product.categoria,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price: Number(product.precio) || 0,
      availability: product.disponible ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  });
}

/* ===============================
   IMAGEN PRODUCTO
=============================== */

function getProductImageByColor(product, colorName) {
  const fallback = product.imagen || '';
  const map = product.imagenesPorColor;
  return map?.[colorName] || fallback;
}

function getSelectedProductImage() {
  return getProductImageByColor(state.selectedProduct, state.selectedColor.name);
}

function updateProductImage() {
  const img = document.querySelector('[data-product-image]');
  if (!img) return;
  img.src = safeUrl(getSelectedProductImage());
}

/* ===============================
   FIT
=============================== */

function renderFitSelector() {
  const wrap = document.querySelector('[data-fit-selector]');
  const value = document.querySelector('[data-fit-value]');

  value.textContent = getFitLabel(state.selectedFit);

  wrap.innerHTML = FITS.map(fit => `
    <label class="fit-option ${state.selectedFit === fit.key ? 'is-selected' : ''}">
      <input type="radio" name="shirt-fit" value="${fit.key}" ${state.selectedFit === fit.key ? 'checked' : ''}>
      <span class="fit-option-title">${fit.label}</span>
      <span class="fit-option-note">${fit.note}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', () => {
      state.selectedFit = input.value;

      adjustSizeForFit(); // 🔥 importante
      renderFitSelector();
      renderSizes();
      renderSizeGuide();
      updateOrderLink();
    });
  });
}

/* ===============================
   TALLES (FIX REAL)
=============================== */

function getAvailableSizes() {
  if (state.selectedFit === 'oversize') {
    return ['M', 'L', 'XL', 'XXL'];
  }
  return SIZES;
}

function adjustSizeForFit() {
  const available = getAvailableSizes();
  if (!available.includes(state.selectedSize)) {
    state.selectedSize = available[0];
  }
}

function renderSizes() {
  const wrap = document.querySelector('[data-size-grid]');
  const value = document.querySelector('[data-size-value]');
  const available = getAvailableSizes();

  value.textContent = state.selectedSize;

  wrap.innerHTML = available.map(size => `
    <label class="size-option ${state.selectedSize === size ? 'is-selected' : ''}">
      <input type="radio" name="shirt-size-choice" value="${size}" ${state.selectedSize === size ? 'checked' : ''}>
      <span>${size}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', () => {
      state.selectedSize = input.value;
      renderSizes();
      updateOrderLink();
    });
  });
}

/* ===============================
   SIZE CHART
=============================== */

function renderSizeGuide() {
  const img = document.querySelector('[data-size-chart-image]');
  const label = document.querySelector('[data-size-chart-label]');
  const card = document.querySelector('[data-size-chart-card]');

  const guide = SIZE_GUIDES[state.selectedFit] || SIZE_GUIDES.regular;

  if (label) label.textContent = guide.label;
  if (!img) return;

  card?.classList.add('is-updating');

  setTimeout(() => {
    img.src = guide.src;
    img.alt = guide.alt;

    card?.classList.remove('is-updating');
    card?.classList.add('is-visible');
  }, 120);
}

/* ===============================
   COLORES
=============================== */

function renderColors() {
  const wrap = document.querySelector('[data-color-swatches]');
  const value = document.querySelector('[data-color-value]');

  value.textContent = state.selectedColor.name;

  wrap.innerHTML = COLORS.map(color => `
    <label class="swatch-card ${state.selectedColor.name === color.name ? 'is-selected' : ''}">
      <input type="radio" name="shirt-color" value="${color.name}" ${state.selectedColor.name === color.name ? 'checked' : ''}>
      <span class="swatch-dot-lg ${color.swatchClass}"></span>
    </label>
  `).join('');

  wrap.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', () => {
      state.selectedColor = COLORS.find(c => c.name === input.value);
      renderColors();
      updateProductImage();
      updateProductSchema(state.selectedProduct);
      updateOrderLink();
    });
  });
}

/* ===============================
   CART
=============================== */

function setupActions() {
  document.querySelector('[data-add-to-cart]')?.addEventListener('click', addCurrentSelectionToCart);
  document.querySelector('[data-clear-cart]')?.addEventListener('click', clearCart);
}

function addCurrentSelectionToCart() {
  const product = state.selectedProduct;

  const item = {
    id: cart.createItemId(product.id, state.selectedColor.name, state.selectedSize, state.selectedFit),
    productId: product.id,
    productName: product.nombre,
    image: getSelectedProductImage(),
    unitPrice: product.precio,
    color: state.selectedColor.name,
    size: state.selectedSize,
    fit: state.selectedFit,
    fitLabel: getFitLabel(state.selectedFit),
    quantity: 1
  };

  state.cart = cart.addItem(state.cart, item);
  cart.save(state.cart);
  renderCart();
  updateOrderLink();
}

function clearCart() {
  state.cart = cart.clear();
  renderCart();
  updateOrderLink();
}

function renderCart() {
  const list = document.querySelector('[data-cart-list]');
  const total = document.querySelector('[data-cart-total]');
  const count = document.querySelector('[data-cart-count]');

  list.innerHTML = state.cart.length
    ? cart.createListMarkup(state.cart)
    : `<div class="cart-empty-state">Vacío</div>`;

  total.textContent = formatPrice(cart.getTotal(state.cart));
  count.textContent = cart.getItemsCount(state.cart) + ' items';
}

function updateOrderLink() {
  document.querySelector('[data-whatsapp-order]').href =
    createWhatsAppLink(cart.buildMessage(state.cart));
}

/* ===============================
   UTILS
=============================== */

function getFitLabel(key) {
  return FITS.find(f => f.key === key)?.label || 'Regular';
}