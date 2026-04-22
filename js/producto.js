import { loadProducts, formatPrice, createWhatsAppLink } from './data-loader.js';

const COLORS = [
  { name: 'Negro', hex: '#111111', text: '#f5ead4' },
  { name: 'Blanco', hex: '#efefef', text: '#111111' },
  { name: 'Rojo', hex: '#b22525', text: '#f5ead4' },
  { name: 'Amarillo', hex: '#e2b022', text: '#111111' },
  { name: 'Gris', hex: '#787878', text: '#f5ead4' },
  { name: 'Azul', hex: '#1a3a6b', text: '#f5ead4' },
  { name: 'Verde', hex: '#1a4a28', text: '#f5ead4' }
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
  cart: []
};

document.addEventListener('DOMContentLoaded', async () => {
  state.products = await loadProducts();
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
});

function setProductFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    state.selectedProduct = state.products[0] || null;
    return;
  }

  state.selectedProduct = state.products.find((p) => String(p.id) === String(productId)) || null;
}

function renderNotFound() {
  const shell = document.querySelector('.product-shell');
  if (!shell) return;

  shell.innerHTML = `
    <div class="panel" style="padding:1.5rem;">
      <h1 class="section-title" style="font-size:2rem;">Producto no encontrado</h1>
      <p class="section-subtitle" style="margin-bottom:1rem;">
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
    imageNode.src = product.imagen;
    imageNode.alt = product.nombre;
  }

  document.title = `${product.nombre} | Retro Remeras`;
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
      <input
        type="radio"
        name="shirt-fit"
        value="${fit.key}"
        ${state.selectedFit === fit.key ? 'checked' : ''}>
      <span class="fit-option-title">${fit.label}</span>
      <span class="fit-option-note">${fit.note}</span>
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
      <input
        type="radio"
        name="shirt-size-choice"
        value="${size}"
        ${state.selectedSize === size ? 'checked' : ''}>
      <span>${size}</span>
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
    valueNode.textContent = state.selectedColor?.name || DEFAULTS.color.name;
  }

  wrap.innerHTML = COLORS.map((color) => `
    <label class="swatch-card ${state.selectedColor?.name === color.name ? 'is-selected' : ''}">
      <input
        type="radio"
        name="shirt-color"
        value="${color.name}"
        ${state.selectedColor?.name === color.name ? 'checked' : ''}>
      <span class="swatch-dot-lg" style="background:${color.hex};"></span>
      <span class="swatch-name">${color.name}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input[name="shirt-color"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedColor = COLORS.find((c) => c.name === input.value) || DEFAULTS.color;
      renderColors();
      updateOrderLink();
    });
  });
}

function setupActions() {
  const addBtn = document.querySelector('[data-add-to-cart]');
  const clearBtn = document.querySelector('[data-clear-cart]');

  addBtn?.addEventListener('click', addCurrentSelectionToCart);
  clearBtn?.addEventListener('click', clearCart);
}

function addCurrentSelectionToCart() {
  const product = state.selectedProduct;
  if (!product) return;

  const fitLabel = getFitLabel(state.selectedFit);

  const existing = state.cart.find((item) =>
    item.productId === product.id &&
    item.color === state.selectedColor.name &&
    item.size === state.selectedSize &&
    item.fit === state.selectedFit
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: createCartItemId(product.id, state.selectedColor.name, state.selectedSize, state.selectedFit),
      productId: product.id,
      productName: product.nombre,
      category: product.categoria,
      image: product.imagen,
      unitPrice: Number(product.precio) || 0,
      color: state.selectedColor.name,
      size: state.selectedSize,
      fit: state.selectedFit,
      fitLabel,
      quantity: 1
    });
  }

  renderCart();
  updateOrderLink();
}

function clearCart() {
  state.cart = [];
  renderCart();
  updateOrderLink();
}

function renderCart() {
  const list = document.querySelector('[data-cart-list]');
  const totalNode = document.querySelector('[data-cart-total]');
  const countNode = document.querySelector('[data-cart-count]');

  if (!list || !totalNode || !countNode) return;

  if (!state.cart.length) {
    list.innerHTML = `
      <div class="cart-empty-state">
        Todavía no agregaste productos al pedido.
      </div>
    `;
  } else {
    list.innerHTML = state.cart.map((item) => `
      <article class="cart-item" data-cart-id="${item.id}">
        <div class="cart-item-head">
          <div class="cart-item-copy">
            <h4>${item.productName}</h4>
            <p>${item.category}</p>
          </div>
          <strong class="cart-item-subtotal">${formatPrice(item.unitPrice * item.quantity)}</strong>
        </div>

        <ul class="cart-item-meta">
          <li><span>Tipo</span><strong>${item.fitLabel}</strong></li>
          <li><span>Color</span><strong>${item.color}</strong></li>
          <li><span>Talle</span><strong>${item.size}</strong></li>
          <li><span>Precio unit.</span><strong>${formatPrice(item.unitPrice)}</strong></li>
        </ul>

        <div class="cart-item-actions">
          <div class="qty-control" aria-label="Cantidad del producto">
            <button type="button" class="qty-btn" data-cart-action="decrease" data-cart-id="${item.id}" aria-label="Restar cantidad">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button type="button" class="qty-btn" data-cart-action="increase" data-cart-id="${item.id}" aria-label="Sumar cantidad">+</button>
          </div>

          <button type="button" class="cart-remove-btn" data-cart-action="remove" data-cart-id="${item.id}">
            Quitar
          </button>
        </div>
      </article>
    `).join('');
  }

  totalNode.textContent = formatPrice(getCartTotal());
  countNode.textContent = `${getCartItemsCount()} item${getCartItemsCount() === 1 ? '' : 's'}`;

  list.querySelectorAll('[data-cart-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-cart-action');
      const id = btn.getAttribute('data-cart-id');
      handleCartAction(action, id);
    });
  });
}

function handleCartAction(action, id) {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;

  if (action === 'increase') {
    item.quantity += 1;
  }

  if (action === 'decrease') {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter((entry) => entry.id !== id);
    }
  }

  if (action === 'remove') {
    state.cart = state.cart.filter((entry) => entry.id !== id);
  }

  renderCart();
  updateOrderLink();
}

function updateOrderLink() {
  const link = document.querySelector('[data-whatsapp-order]');
  if (!link) return;

  link.href = createWhatsAppLink(buildWhatsAppMessage());
  link.target = '_blank';
  link.rel = 'noopener';
}

function buildWhatsAppMessage() {
  if (state.cart.length) {
    let msg = 'Hola! Quiero hacer un pedido:\n\n';

    state.cart.forEach((item, index) => {
      msg += `${index + 1}) ${item.productName}\n`;
      msg += `🏷️ Categoría: ${item.category}\n`;
      msg += `🧵 Tipo: ${item.fitLabel}\n`;
      msg += `📏 Talle: ${item.size}\n`;
      msg += `🎨 Color: ${item.color}\n`;
      msg += `🔢 Cantidad: ${item.quantity}\n`;
      msg += `💰 Subtotal ref.: ${formatPrice(item.unitPrice * item.quantity)}\n\n`;
    });

    msg += `💵 Total estimado: ${formatPrice(getCartTotal())}\n\n`;
    msg += '¿Podés confirmar disponibilidad?';
    return msg;
  }

  const product = state.selectedProduct;
  if (!product) {
    return 'Hola! Quiero consultar por una remera personalizada.';
  }

  return `Hola! Quiero hacer un pedido:\n\n👕 Producto: ${product.nombre}\n🏷️ Categoría: ${product.categoria}\n🧵 Tipo: ${getFitLabel(state.selectedFit)}\n📏 Talle: ${state.selectedSize}\n🎨 Color: ${state.selectedColor.name}\n💰 Precio de referencia: ${formatPrice(product.precio)}\n\n¿Podés confirmar disponibilidad?`;
}

function getFitLabel(fit) {
  return fit === 'oversize' ? 'Oversize' : 'Regular';
}

function getCartTotal() {
  return state.cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
}

function getCartItemsCount() {
  return state.cart.reduce((acc, item) => acc + item.quantity, 0);
}

function createCartItemId(productId, color, size, fit) {
  return `${productId}-${color}-${size}-${fit}`;
}