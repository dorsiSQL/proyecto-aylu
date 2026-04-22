import { loadProducts, formatPrice, createWhatsAppLink } from './data-loader.js';

const COLORS = [
  { name: 'Negro',    hex: '#111111', text: '#f5ead4' },
  { name: 'Blanco',   hex: '#efefef', text: '#111111' },
  { name: 'Rojo',     hex: '#b22525', text: '#f5ead4' },
  { name: 'Amarillo', hex: '#e2b022', text: '#111111' },
  { name: 'Gris',     hex: '#787878', text: '#f5ead4' },
  { name: 'Azul',     hex: '#1a3a6b', text: '#f5ead4' },
  { name: 'Verde',    hex: '#1a4a28', text: '#f5ead4' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SIZE_GROUPS = [
  { key: 'regular', label: 'Talles' },
  { key: 'oversize', label: 'Oversize' }
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
  renderColors();
  renderSizes();
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

  const cats = ['Todos', ...new Set(state.products.map((p) => p.categoria))];

  wrap.innerHTML = cats.map((cat) => `
    <button class="filter-pill ${cat === state.activeCategory ? 'is-active' : ''}"
            type="button"
            data-cat-filter="${cat}">
      ${cat}
    </button>
  `).join('');

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat-filter]');
    if (!btn) return;

    state.activeCategory = btn.getAttribute('data-cat-filter');

    wrap.querySelectorAll('[data-cat-filter]').forEach((b) => {
      b.classList.toggle('is-active', b.getAttribute('data-cat-filter') === state.activeCategory);
    });

    renderProductGrid();
  });
}

function renderProductGrid() {
  const container = document.querySelector('[data-design-grid]');
  if (!container) return;

  const visible = state.activeCategory === 'Todos'
    ? state.products
    : state.products.filter((p) => p.categoria === state.activeCategory);

  container.innerHTML = visible.map((product) => {
    const isSelected = state.selectedProduct?.id === product.id;

    return `
      <button class="design-card ${isSelected ? 'is-selected' : ''}"
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
    });
  });
}

function renderColors() {
  const wrap = document.querySelector('[data-color-swatches]');
  if (!wrap) return;

  wrap.innerHTML = COLORS.map((color) => `
    <label class="swatch ${state.selectedColor.name === color.name ? 'is-selected' : ''}">
      <input type="radio" name="shirt-color" value="${color.name}" ${state.selectedColor.name === color.name ? 'checked' : ''}>
      <span class="swatch-dot" style="background:${color.hex}; border-color:rgba(255,255,255,.2);"></span>
      <span>${color.name}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input[name="shirt-color"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedColor = COLORS.find((c) => c.name === input.value) || COLORS[0];
      renderColors();
      updateSummary();
    });
  });
}

function renderSizes() {
  const wrap = document.querySelector('[data-size-groups]');
  if (!wrap) return;

  wrap.innerHTML = SIZE_GROUPS.map((group) => `
    <div class="size-group-card">
      <div class="size-group-title">${group.label}</div>
      <div class="size-grid">
        ${SIZES.map((size) => `
          <label class="size-option ${state.selectedFit === group.key && state.selectedSize === size ? 'is-selected' : ''}">
            <input
              type="radio"
              name="shirt-size-choice"
              value="${size}"
              data-fit="${group.key}"
              ${state.selectedFit === group.key && state.selectedSize === size ? 'checked' : ''}>
            <span>${size}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('input[name="shirt-size-choice"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedSize = input.value;
      state.selectedFit = input.dataset.fit || 'regular';
      renderSizes();
      updateSummary();
    });
  });
}

function updateSummary() {
  const designNode  = document.querySelector('[data-summary-design]');
  const colorNode   = document.querySelector('[data-summary-color]');
  const sizeNode    = document.querySelector('[data-summary-size]');
  const catNode     = document.querySelector('[data-summary-category]');
  const priceNode   = document.querySelector('[data-summary-price]');
  const shirtImage  = document.querySelector('[data-shirt-preview-image]');
  const waLinks     = document.querySelectorAll('[data-whatsapp-link]');
  const mobileName  = document.querySelector('[data-mobile-cta-product]');

  const p = state.selectedProduct;
  const cleanName = p ? p.nombre.replace(/^Remera\s+/i, '') : 'Sin seleccionar';
  const fitLabel = state.selectedFit === 'oversize' ? 'Oversize' : 'Regular';
  const fullSizeLabel = `${fitLabel} ${state.selectedSize}`;

  if (designNode) designNode.textContent = p ? p.nombre : '—';
  if (catNode) catNode.textContent = p ? p.categoria : '—';
  if (colorNode) colorNode.textContent = state.selectedColor.name;
  if (sizeNode) sizeNode.textContent = fullSizeLabel;
  if (priceNode) priceNode.textContent = p ? formatPrice(p.precio) : '';

  if (shirtImage && p) {
    shirtImage.src = p.imagen;
    shirtImage.alt = p.nombre;
  }

  if (mobileName) {
    mobileName.textContent = p ? p.nombre : 'Elegí un diseño para comenzar';
  }

  if (p) {
    const msg = `Hola! Quiero hacer un pedido:\n\n👕 Producto: ${p.nombre}\n🏷️ Categoría: ${p.categoria}\n🎨 Color: ${state.selectedColor.name}\n📏 Talle: ${state.selectedSize}\n🧵 Calce: ${fitLabel}\n💰 Precio de referencia: ${formatPrice(p.precio)}\n\n¿Podés confirmar disponibilidad?`;
    waLinks.forEach((link) => {
      link.href = createWhatsAppLink(msg);
      link.target = '_blank';
      link.rel = 'noopener';
    });
  } else {
    waLinks.forEach((link) => { link.href = '#'; });
  }
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
      renderColors();
      renderSizes();
      updateSummary();
    });
  }

  if (customBtn) {
    customBtn.addEventListener('click', () => {
      const msg = 'Hola! Quiero pedir una remera con un diseño personalizado. ¿Me podés dar más información?';
      window.open(createWhatsAppLink(msg), '_blank', 'noopener');
    });
  }
}