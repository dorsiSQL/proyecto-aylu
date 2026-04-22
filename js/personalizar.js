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
  {
    key: 'regular',
    label: 'Regular',
    note: 'Calce clásico'
  },
  {
    key: 'oversize',
    label: 'Oversize',
    note: 'Más amplio y relajado'
  }
];

const state = {
  products: [],
  selectedProduct: null,
  selectedColor: COLORS[0],
  selectedSize: 'M',
  selectedFit: 'regular',
  activeCategory: 'Todos'
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
        hint.textContent = `Seleccionaste "${found.nombre}" desde el catálogo. Podés cambiarlo eligiendo otro diseño.`;
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

    return `
      <button
        class="design-card ${isSelected ? 'is-selected' : ''}"
        type="button"
        data-product-id="${product.id}"
        aria-pressed="${isSelected}">
        <div class="design-card-visual">
          <img src="${product.imagen}" alt="${product.nombre}">
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
      animateSummaryCard();
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
      state.selectedFit = input.value || 'regular';
      renderFitSelector();
      renderSizes();
      updateSummary();
      animateSummaryCard();
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
      animateSummaryCard();
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
      state.selectedColor = COLORS.find((c) => c.name === input.value) || COLORS[0];
      renderColors();
      updateSummary();
      animateSummaryCard();
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
  const waLinks = document.querySelectorAll('[data-whatsapp-link]');
  const mobileName = document.querySelector('[data-mobile-cta-product]');

  const product = state.selectedProduct;
  const fitLabel = state.selectedFit === 'oversize' ? 'Oversize' : 'Regular';

  if (designNode) designNode.textContent = product ? product.nombre : '—';
  if (catNode) catNode.textContent = product ? product.categoria : '—';
  if (fitNode) fitNode.textContent = fitLabel;
  if (colorNode) colorNode.textContent = state.selectedColor.name;
  if (sizeNode) sizeNode.textContent = state.selectedSize;
  if (priceNode) priceNode.textContent = product ? formatPrice(product.precio) : '';

  if (shirtImage && product) {
    shirtImage.src = product.imagen;
    shirtImage.alt = product.nombre;
  }

  if (mobileName) {
    mobileName.textContent = product
      ? `${product.nombre} · ${fitLabel} ${state.selectedSize}`
      : 'Elegí un diseño para comenzar';
  }

  if (product) {
    const msg = `Hola! Quiero hacer un pedido:\n\n👕 Producto: ${product.nombre}\n🏷️ Categoría: ${product.categoria}\n🧵 Tipo: ${fitLabel}\n📏 Talle: ${state.selectedSize}\n🎨 Color: ${state.selectedColor.name}\n💰 Precio de referencia: ${formatPrice(product.precio)}\n\n¿Podés confirmar disponibilidad?`;

    waLinks.forEach((link) => {
      link.href = createWhatsAppLink(msg);
      link.target = '_blank';
      link.rel = 'noopener';
    });
  } else {
    waLinks.forEach((link) => {
      link.href = '#';
    });
  }
}

function animateSummaryCard() {
  const summaryCard = document.querySelector('.summary-card');
  if (!summaryCard) return;

  summaryCard.classList.remove('is-updating');
  void summaryCard.offsetWidth;
  summaryCard.classList.add('is-updating');

  window.clearTimeout(summaryCard._updateTimer);
  summaryCard._updateTimer = window.setTimeout(() => {
    summaryCard.classList.remove('is-updating');
  }, 260);
}

function setupActions() {
  const resetBtn = document.querySelector('[data-reset-selection]');
  const customBtn = document.querySelector('[data-custom-request]');

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.selectedProduct = state.products[0] || null;
      state.selectedColor = COLORS[0];
      state.selectedSize = 'M';
      state.selectedFit = 'regular';
      state.activeCategory = 'Todos';

      renderCategoryFilters();
      renderProductGrid();
      renderFitSelector();
      renderSizes();
      renderColors();
      updateSummary();
      animateSummaryCard();
    });
  }

  if (customBtn) {
    customBtn.addEventListener('click', () => {
      const msg = 'Hola! Quiero pedir una remera con un diseño personalizado. ¿Me podés dar más información?';
      window.open(createWhatsAppLink(msg), '_blank', 'noopener');
    });
  }
}