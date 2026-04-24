import { loadProducts, formatPrice, createWhatsAppLink, renderDataNotice, escapeHtml, safeUrl } from './data-loader.js';
import { cart } from './cart.js';

const COLORS = [
  { name: 'Negro', swatchClass: 'swatch-dot--negro' },
  { name: 'Blanco', swatchClass: 'swatch-dot--blanco' },
  
//  { name: 'Rojo', swatchClass: 'swatch-dot--rojo' },
//  { name: 'Amarillo', swatchClass: 'swatch-dot--amarillo' },
//  { name: 'Gris', swatchClass: 'swatch-dot--gris' },
//  { name: 'Azul', swatchClass: 'swatch-dot--azul' },
//  { name: 'Verde', swatchClass: 'swatch-dot--verde' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const FITS = [
  { key: 'regular', label: 'Regular', note: 'Calce clásico' },
  { key: 'oversize', label: 'Oversize', note: 'Más amplio y relajado' }
];

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
    renderCart();
    updateOrderLink();
    setupActions();
  } catch (error) {
    console.error('Error inicializando producto:', error);
    renderNotFound();
  }
}

function setProductFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    state.selectedProduct = state.products[0] || null;
    return;
  }

  state.selectedProduct =
    state.products.find((product) => String(product.id) === String(productId)) || null;
}

function renderNotFound() {
  const shell = document.querySelector('.product-shell');
  if (!shell) return;

  shell.innerHTML = `
    <div class="panel product-not-found">
      <h1 class="section-title product-not-found__title">Producto no encontrado</h1>
      <p class="section-subtitle product-not-found__subtitle">
        No pudimos encontrar ese diseño. Probá volviendo al catálogo.
      </p>
      <a class="btn btn-primary" href="catalogo.html">Volver al catálogo</a>
    </div>
  `;
}

function renderProduct() {
  const product = state.selectedProduct;
  if (!product) return;

  const breadcrumb = document.querySelector('[data-product-breadcrumb]');
  const nameNode = document.querySelector('[data-product-name]');
  const categoryNode = document.querySelector('[data-product-category]');
  const priceNode = document.querySelector('[data-product-price]');
  const descNode = document.querySelector('[data-product-description]');
  const imageNode = document.querySelector('[data-product-image]');

  if (breadcrumb) breadcrumb.textContent = product.nombre;
  if (nameNode) nameNode.textContent = product.nombre;
  if (categoryNode) categoryNode.textContent = product.categoria;
  if (priceNode) priceNode.textContent = formatPrice(product.precio);
  if (descNode) descNode.textContent = product.descripcion;

  if (imageNode) {
    imageNode.src = safeUrl(product.imagen);
    imageNode.loading = 'eager';
    imageNode.decoding = 'async';
    imageNode.alt = product.nombre;
  }

  document.title = `${product.nombre} | Retro Remeras`;
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

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: String(product.nombre || 'Remera personalizada'),
    description: String(product.descripcion || 'Remera personalizada de Retro Remeras'),
    image: safeUrl(product.imagen, ''),
    category: String(product.categoria || 'Remeras'),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price: Number(product.precio) || 0,
      availability: product.disponible ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  node.textContent = JSON.stringify(schema);
}

function renderFitSelector() {
  const wrap = document.querySelector('[data-fit-selector]');
  const valueNode = document.querySelector('[data-fit-value]');
  if (!wrap) return;

  if (valueNode) {
    valueNode.textContent = getFitLabel(state.selectedFit);
  }

  wrap.innerHTML = FITS.map((fit) => `
    <label class="fit-option ${state.selectedFit === fit.key ? 'is-selected' : ''}">
      <input type="radio" name="shirt-fit" value="${escapeHtml(fit.key)}" ${state.selectedFit === fit.key ? 'checked' : ''}>
      <span class="fit-option-title">${escapeHtml(fit.label)}</span>
      <span class="fit-option-note">${escapeHtml(fit.note)}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input[name="shirt-fit"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedFit = input.value || DEFAULTS.fit;
      renderFitSelector();
      updateOrderLink();
    });
  });
}

function renderSizes() {
  const wrap = document.querySelector('[data-size-grid]');
  const valueNode = document.querySelector('[data-size-value]');
  if (!wrap) return;

  if (valueNode) {
    valueNode.textContent = state.selectedSize;
  }

  wrap.innerHTML = SIZES.map((size) => `
    <label class="size-option ${state.selectedSize === size ? 'is-selected' : ''}">
      <input type="radio" name="shirt-size-choice" value="${escapeHtml(size)}" ${state.selectedSize === size ? 'checked' : ''}>
      <span>${escapeHtml(size)}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input[name="shirt-size-choice"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedSize = input.value || DEFAULTS.size;
      renderSizes();
      updateOrderLink();
    });
  });
}

function renderColors() {
  const wrap = document.querySelector('[data-color-swatches]');
  const valueNode = document.querySelector('[data-color-value]');
  if (!wrap) return;

  if (valueNode) {
    valueNode.textContent = state.selectedColor.name;
  }

  wrap.innerHTML = COLORS.map((color) => `
    <label class="swatch-card ${state.selectedColor.name === color.name ? 'is-selected' : ''}">
      <input type="radio" name="shirt-color" value="${escapeHtml(color.name)}" ${state.selectedColor.name === color.name ? 'checked' : ''}>
      <span class="swatch-dot-lg ${escapeHtml(color.swatchClass)}"></span>
      <span class="swatch-name">${escapeHtml(color.name)}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input[name="shirt-color"]').forEach((input) => {
    input.addEventListener('change', () => {
      const selected = COLORS.find((color) => color.name === input.value);
      state.selectedColor = selected || DEFAULTS.color;
      renderColors();
      updateOrderLink();
    });
  });
}

function setupActions() {
  const addBtn = document.querySelector('[data-add-to-cart]');
  const clearBtn = document.querySelector('[data-clear-cart]');
  const list = document.querySelector('[data-cart-list]');

  if (addBtn) {
    addBtn.addEventListener('click', addCurrentSelectionToCart);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearCart);
  }

  if (list) {
    list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cart-action]');
      if (!button) return;

      const action = button.getAttribute('data-cart-action');
      const id = button.getAttribute('data-cart-id');
      handleCartAction(action, id);
    });
  }
}

function addCurrentSelectionToCart() {
  const product = state.selectedProduct;
  if (!product) return;

  const fitLabel = getFitLabel(state.selectedFit);

  const nextItem = {
    id: cart.createItemId(product.id, state.selectedColor.name, state.selectedSize, state.selectedFit),
    productId: product.id,
    productName: product.nombre,
    category: product.categoria,
    image: product.imagen,
    unitPrice: Number(product.precio) || 0,
    color: state.selectedColor.name,
    size: state.selectedSize,
    fit: state.selectedFit,
    fitLabel: fitLabel,
    quantity: 1
  };

  state.cart = cart.addItem(state.cart, nextItem);
  cart.save(state.cart);
  renderCart();
  updateOrderLink();
  pulseCartPanel();
  showToast('Producto agregado al pedido');
}

function handleCartAction(action, id) {
  if (!id) return;

  if (action === 'increase') {
    state.cart = cart.changeQuantity(state.cart, id, 1);
  } else if (action === 'decrease') {
    state.cart = cart.changeQuantity(state.cart, id, -1);
  } else if (action === 'remove') {
    state.cart = cart.removeItem(state.cart, id);
  }

  cart.save(state.cart);
  renderCart();
  updateOrderLink();
}

function clearCart() {
  state.cart = cart.clear();
  renderCart();
  updateOrderLink();
  showToast('Pedido vaciado');
}

function renderCart() {
  const list = document.querySelector('[data-cart-list]');
  const totalNode = document.querySelector('[data-cart-total]');
  const countNode = document.querySelector('[data-cart-count]');

  if (!list || !totalNode || !countNode) return;

  if (!state.cart.length) {
    list.innerHTML = `
      <div class="cart-empty-state cart-empty-state--rich">
        <h3>Tu pedido está vacío</h3>
        <p>Elegí un diseño, personalizalo y sumalo acá para enviarlo todo junto por WhatsApp.</p>
        <a class="btn btn-secondary cart-empty-state__btn" href="catalogo.html">Explorar catálogo</a>
      </div>
    `;
  } else {
    list.innerHTML = cart.createListMarkup(state.cart);
  }

  totalNode.textContent = formatPrice(cart.getTotal(state.cart));

  const itemsCount = cart.getItemsCount(state.cart);
  countNode.textContent = `${itemsCount} item${itemsCount === 1 ? '' : 's'}`;
}

function updateOrderLink() {
  const link = document.querySelector('[data-whatsapp-order]');
  if (!link) return;

  const message = cart.buildMessage(state.cart);
  link.href = createWhatsAppLink(message);
  link.target = '_blank';
  link.rel = 'noopener';
}

function getFitLabel(fitKey) {
  const match = FITS.find((fit) => fit.key === fitKey);
  return match ? match.label : 'Regular';
}

function pulseCartPanel() {
  const panel = document.querySelector('.product-order-box');
  if (!panel) return;

  panel.classList.remove('is-pulsing');
  void panel.offsetWidth;
  panel.classList.add('is-pulsing');

  setTimeout(() => {
    panel.classList.remove('is-pulsing');
  }, 650);
}

function showToast(message) {
  let toast = document.querySelector('[data-product-toast]');

  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'product-toast';
    toast.setAttribute('data-product-toast', 'true');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove('is-visible');
  void toast.offsetWidth;
  toast.classList.add('is-visible');

  clearTimeout(showToast._timer);

  showToast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2200);
}