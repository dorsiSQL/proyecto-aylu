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
  fit: 'regular',
  category: 'Todos'
};

const state = {
  products: [],
  selectedProduct: null,
  selectedColor: DEFAULTS.color,
  selectedSize: DEFAULTS.size,
  selectedFit: DEFAULTS.fit,
  activeCategory: DEFAULTS.category,
  cart: []
};

document.addEventListener('DOMContentLoaded', async () => {
  state.products = await loadProducts();

  applyQueryParams();
  renderCategoryFilters();
  renderProductGrid();
  renderFitSelector();
  renderSizes();
  renderColors();
  updateSummary();
  renderCart();
  setupActions();
});

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('producto');

  if (productId) {
    const found = state.products.find((p) => String(p.id) === String(productId));
    if (found) {
      state.selectedProduct = found;
      const hint = document.querySelector('[data-design-hint]');
      if (hint) {
        hint.textContent = `Seleccionaste "${found.nombre}" desde el catálogo. Podés cambiarlo eligiendo otro diseño o agregarlo al pedido.`;
      }
      return;
    }
  }

  state.selectedProduct = state.products[0] || null;
}

function renderCategoryFilters() {
  const wrap = document.querySelector('[data-design-category-filters]');
  if (!wrap) return;

  const categories = ['Todos', ...new Set(state.products.map((p) => p.categoria))];

  wrap.innerHTML = categories.map((cat) => `
    <button
      class="filter-pill ${cat === state.activeCategory ? 'is-active' : ''}"
      type="button"
      data-cat-filter="${cat}">
      ${cat}
    </button>
  `).join('');

  wrap.querySelectorAll('[data-cat-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.getAttribute('data-cat-filter');
      renderCategoryFilters();
      renderProductGrid();
    });
  });
}

function renderProductGrid() {
  const container = document.querySelector('[data-design-grid]');
  if (!container) return;

  const visibleProducts = state.activeCategory === 'Todos'
    ? state.products
    : state.products.filter((p) => p.categoria === state.activeCategory);

  container.innerHTML = visibleProducts.map((product) => {
    const isSelected = state.selectedProduct?.id === product.id;
    const productCount = state.cart
      .filter((item) => item.productId === product.id)
      .reduce((acc, item) => acc + item.quantity, 0);

    return `
      <button
        class="design-card ${isSelected ? 'is-selected' : ''}"
        type="button"
        data-product-id="${product.id}"
        aria-pressed="${isSelected}">
        <div class="design-card-visual">
          <img src="${product.imagen}" alt="${product.nombre}">
          ${productCount > 0 ? `<span class="design-card-badge">${productCount} en pedido</span>` : ''}
        </div>

        <div class="design-card-content">
          <span class="product-category">${product.categoria}</span>
          <h3>${product.nombre}</h3>
          <p class="section-subtitle">${product.descripcion}</p>
          <span class="design-card-price">${formatPrice(product.precio)}</span>
        </div>

        ${isSelected ? '<span class="design-card-check" aria-hidden="true">✓</span>' : ''}
      </button>
    `;
  }).join('');

  container.querySelectorAll('[data-product-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-product-id');
      state.selectedProduct = state.products.find((p) => String(p.id) === String(id)) || null;
      renderProductGrid();
      updateSummary();
    });
  });
}

function renderFitSelector() {
  const wrap = document.querySelector('[data-fit-selector]');
  if (!wrap) return;

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
      renderSizes();
      updateSummary();
    });
  });
}

function renderSizes() {
  const wrap = document.querySelector('[data-size-groups]');
  const banner = document.querySelector('[data-selected-fit-banner]');
  const stepHint = document.querySelector('[data-size-step-hint]');
  if (!wrap) return;

  const currentFit = FITS.find((fit) => fit.key === state.selectedFit) || FITS[0];

  if (banner) {
    banner.innerHTML = `Estás viendo talles para: <strong>${currentFit.label}</strong>`;
  }

  if (stepHint) {
    stepHint.textContent = `Seleccioná el talle disponible para tu remera ${currentFit.label.toLowerCase()}.`;
  }

  wrap.innerHTML = `
    <div class="size-group-card is-single-fit">
      <div class="size-group-title">${currentFit.label}</div>
      <div class="size-grid">
        ${SIZES.map((size) => `
          <label class="size-option ${state.selectedSize === size ? 'is-selected' : ''}">
            <input
              type="radio"
              name="shirt-size-choice"
              value="${size}"
              ${state.selectedSize === size ? 'checked' : ''}>
            <span>${size}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;

  wrap.querySelectorAll('input[name="shirt-size-choice"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedSize = input.value;
      renderSizes();
      updateSummary();
    });
  });
}

function renderColors() {
  const wrap = document.querySelector('[data-color-swatches]');
  if (!wrap) return;

  wrap.innerHTML = COLORS.map((color) => `
    <label class="swatch ${state.selectedColor.name === color.name ? 'is-selected' : ''}">
      <input
        type="radio"
        name="shirt-color"
        value="${color.name}"
        ${state.selectedColor.name === color.name ? 'checked' : ''}>
      <span class="swatch-dot" style="background:${color.hex}; border-color:rgba(255,255,255,.2);"></span>
      <span>${color.name}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input[name="shirt-color"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedColor = COLORS.find((c) => c.name === input.value) || DEFAULTS.color;
      renderColors();
      updateSummary();
    });
  });
}

function updateSummary() {
  const designNode = document.querySelector('[data-summary-design]');
  const colorNode = document.querySelector('[data-summary-color]');
  const sizeNode = document.querySelector('[data-summary-size]');
  const fitNode = document.querySelector('[data-summary-fit]');
  const catNode = document.querySelector('[data-summary-category]');
  const priceNode = document.querySelector('[data-summary-price]');
  const shirtImage = document.querySelector('[data-shirt-preview-image]');

  const product = state.selectedProduct;
  const fitLabel = getFitLabel(state.selectedFit);

  if (designNode) designNode.textContent = product ? product.nombre : '—';
  if (catNode) catNode.textContent = product ? product.categoria : '—';
  if (fitNode) fitNode.textContent = fitLabel;
  if (colorNode) colorNode.textContent = state.selectedColor.name;
  if (sizeNode) sizeNode.textContent = state.selectedSize;
  if (priceNode) priceNode.textContent = product ? formatPrice(product.precio) : '—';

  if (shirtImage && product) {
    shirtImage.src = product.imagen;
    shirtImage.alt = product.nombre;
  }

  updateOrderLinks();
  updateMobileCtaText();
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

  renderProductGrid();
  updateOrderLinks();
  updateMobileCtaText();
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
}

function resetCurrentSelection() {
  state.activeCategory = DEFAULTS.category;
  state.selectedColor = DEFAULTS.color;
  state.selectedSize = DEFAULTS.size;
  state.selectedFit = DEFAULTS.fit;
  state.selectedProduct = state.products[0] || null;

  renderCategoryFilters();
  renderProductGrid();
  renderFitSelector();
  renderSizes();
  renderColors();
  updateSummary();
}

function updateOrderLinks() {
  const orderLinks = document.querySelectorAll('[data-whatsapp-order]');
  const msg = buildWhatsAppMessage();

  orderLinks.forEach((link) => {
    link.href = createWhatsAppLink(msg);
    link.target = '_blank';
    link.rel = 'noopener';
  });
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

function setupActions() {
  const resetBtn = document.querySelector('[data-reset-selection]');
  const customBtn = document.querySelector('[data-custom-request]');
  const clearCartBtn = document.querySelector('[data-clear-cart]');
  const addToCartButtons = document.querySelectorAll('[data-add-to-cart]');

  addToCartButtons.forEach((btn) => {
    btn.addEventListener('click', addCurrentSelectionToCart);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', resetCurrentSelection);
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      state.cart = [];
      renderCart();
    });
  }

  if (customBtn) {
    customBtn.addEventListener('click', () => {
      const msg = 'Hola! Quiero pedir una remera con un diseño personalizado. ¿Me podés dar más información?';
      window.open(createWhatsAppLink(msg), '_blank', 'noopener');
    });
  }
}

function updateMobileCtaText() {
  const mobileName = document.querySelector('[data-mobile-cta-product]');
  if (!mobileName) return;

  if (state.cart.length) {
    mobileName.textContent = `${getCartItemsCount()} item${getCartItemsCount() === 1 ? '' : 's'} · ${formatPrice(getCartTotal())}`;
    return;
  }

  if (state.selectedProduct) {
    mobileName.textContent = `${state.selectedProduct.nombre} · ${getFitLabel(state.selectedFit)} ${state.selectedSize}`;
    return;
  }

  mobileName.textContent = 'Elegí un diseño para comenzar';
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