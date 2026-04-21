import { loadProducts, formatPrice, createWhatsAppLink } from './data-loader.js';

/* ── Opciones fijas ──────────────────────────────── */
const COLORS = [
  { name: 'Negro',     hex: '#111111', text: '#f5ead4' },
  { name: 'Blanco',    hex: '#efefef', text: '#111111' },
  { name: 'Rojo',      hex: '#b22525', text: '#f5ead4' },
  { name: 'Amarillo',  hex: '#e2b022', text: '#111111' },
  { name: 'Gris',      hex: '#787878', text: '#f5ead4' },
  { name: 'Azul',      hex: '#1a3a6b', text: '#f5ead4' },
  { name: 'Verde',     hex: '#1a4a28', text: '#f5ead4' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const CATEGORY_META = {
  'Fútbol':          { bg: 'linear-gradient(145deg,#0d2018,#0a1a10)', accent: '#28a050' },
  'Anime':           { bg: 'linear-gradient(145deg,#1a0d30,#0d0820)', accent: '#a050ff' },
  'Cine / Películas':{ bg: 'linear-gradient(145deg,#2a0a0a,#1e0808)', accent: '#c82f2f' },
  'Videojuegos':     { bg: 'linear-gradient(145deg,#0a1a2e,#081520)', accent: '#00b4e6' },
  'Variados':        { bg: 'linear-gradient(145deg,#2a1500,#1e1000)', accent: '#dc7a1e' },
  'Vintage':         { bg: 'linear-gradient(145deg,#221508,#1a1005)', accent: '#dcb450' },
};

/* ── Estado ──────────────────────────────────────── */
const state = {
  products:      [],
  selectedProduct: null,
  selectedColor:   COLORS[0],
  selectedSize:    'M',
  activeCategory:  'Todos',
};

/* ── Init ────────────────────────────────────────── */
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

/* ── Query params ────────────────────────────────── */
function applyQueryParams() {
  const params    = new URLSearchParams(window.location.search);
  const productId = params.get('producto');

  if (productId) {
    const found = state.products.find(p => String(p.id) === String(productId));
    if (found) {
      state.selectedProduct = found;
      const hint = document.querySelector('[data-design-hint]');
      if (hint) hint.textContent = `Seleccionaste "${found.nombre}" desde el catálogo. Podés cambiarlo eligiendo otro diseño.`;
      return;
    }
  }

  // Default: first product
  state.selectedProduct = state.products[0] || null;
}

/* ── Filtros de categoría ─────────────────────────── */
function renderCategoryFilters() {
  const wrap = document.querySelector('[data-design-category-filters]');
  if (!wrap) return;

  const cats = ['Todos', ...new Set(state.products.map(p => p.categoria))];
  wrap.innerHTML = cats.map(cat => `
    <button class="filter-pill ${cat === state.activeCategory ? 'is-active' : ''}"
            type="button" data-cat-filter="${cat}">${cat}</button>
  `).join('');

  wrap.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat-filter]');
    if (!btn) return;
    state.activeCategory = btn.getAttribute('data-cat-filter');
    wrap.querySelectorAll('[data-cat-filter]').forEach(b =>
      b.classList.toggle('is-active', b.getAttribute('data-cat-filter') === state.activeCategory));
    renderProductGrid();
  });
}

/* ── Grid de productos (diseños elegibles) ─────────── */
function renderProductGrid() {
  const container = document.querySelector('[data-design-grid]');
  if (!container) return;

  const visible = state.activeCategory === 'Todos'
    ? state.products
    : state.products.filter(p => p.categoria === state.activeCategory);

  container.innerHTML = visible.map(product => {
    const meta      = CATEGORY_META[product.categoria] || { bg: '#111', accent: '#f4c542' };
    const isSelected = state.selectedProduct?.id === product.id;
    const cleanName  = product.nombre.replace(/^Remera\s+/i, '');

    return `
      <button class="design-card ${isSelected ? 'is-selected' : ''}"
              type="button" data-product-id="${product.id}" aria-pressed="${isSelected}">
        <div class="design-card-visual cat-visual"
             style="background:${meta.bg}; --accent:${meta.accent}; aspect-ratio:1/1;">
          <div class="cat-visual__shirt cat-visual__shirt--sm">
            <span class="cat-visual__shirt-text">${cleanName}</span>
          </div>
        </div>
        <div class="design-card-content">
          <span class="product-category" style="font-size:.8rem;">${product.categoria}</span>
          <h3 style="font-size:1.1rem; margin:.2rem 0 .1rem;">${product.nombre}</h3>
          <p class="section-subtitle" style="font-size:.85rem;">${product.descripcion}</p>
          <span class="design-card-price">${formatPrice(product.precio)}</span>
        </div>
        ${isSelected ? '<span class="design-card-check" aria-hidden="true">✓</span>' : ''}
      </button>`;
  }).join('');

  container.querySelectorAll('[data-product-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-product-id');
      state.selectedProduct = state.products.find(p => String(p.id) === String(id)) || null;
      renderProductGrid();
      updateSummary();
    });
  });
}

/* ── Colores ─────────────────────────────────────── */
function renderColors() {
  const wrap = document.querySelector('[data-color-swatches]');
  if (!wrap) return;

  wrap.innerHTML = COLORS.map(color => `
    <label class="swatch ${state.selectedColor.name === color.name ? 'is-selected' : ''}">
      <input type="radio" name="shirt-color" value="${color.name}" ${state.selectedColor.name === color.name ? 'checked' : ''}>
      <span class="swatch-dot" style="background:${color.hex}; border-color:rgba(255,255,255,.2);"></span>
      <span>${color.name}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input[name="shirt-color"]').forEach(input => {
    input.addEventListener('change', () => {
      state.selectedColor = COLORS.find(c => c.name === input.value) || COLORS[0];
      renderColors();
      updateSummary();
    });
  });
}

/* ── Talles ──────────────────────────────────────── */
function renderSizes() {
  const wrap = document.querySelector('[data-size-grid]');
  if (!wrap) return;

  wrap.innerHTML = SIZES.map(size => `
    <label class="size-option ${state.selectedSize === size ? 'is-selected' : ''}">
      <input type="radio" name="shirt-size" value="${size}" ${state.selectedSize === size ? 'checked' : ''}>
      <span>${size}</span>
    </label>
  `).join('');

  wrap.querySelectorAll('input[name="shirt-size"]').forEach(input => {
    input.addEventListener('change', () => {
      state.selectedSize = input.value;
      renderSizes();
      updateSummary();
    });
  });
}

/* ── Resumen + WhatsApp ──────────────────────────── */
function updateSummary() {
  const designNode  = document.querySelector('[data-summary-design]');
  const colorNode   = document.querySelector('[data-summary-color]');
  const sizeNode    = document.querySelector('[data-summary-size]');
  const catNode     = document.querySelector('[data-summary-category]');
  const priceNode   = document.querySelector('[data-summary-price]');
  const shirt       = document.querySelector('[data-shirt-preview]');
  const shirtText   = document.querySelector('[data-shirt-text]');
  const waLink      = document.querySelector('[data-whatsapp-link]');

  const p         = state.selectedProduct;
  const cleanName = p ? p.nombre.replace(/^Remera\s+/i, '') : 'Sin seleccionar';

  if (designNode)  designNode.textContent  = p ? p.nombre : '—';
  if (catNode)     catNode.textContent     = p ? p.categoria : '—';
  if (colorNode)   colorNode.textContent   = state.selectedColor.name;
  if (sizeNode)    sizeNode.textContent    = state.selectedSize;
  if (priceNode)   priceNode.textContent   = p ? formatPrice(p.precio) : '';

  if (shirt) {
    shirt.style.setProperty('--shirt-color',      state.selectedColor.hex);
    shirt.style.setProperty('--shirt-text-color', state.selectedColor.text);
  }

  if (shirtText) {
    shirtText.innerHTML = cleanName.split(' ').slice(0, 3).join('<br>');
  }

  if (waLink && p) {
    const msg = `Hola! Quiero hacer un pedido:\n\n👕 Producto: ${p.nombre}\n🏷️ Categoría: ${p.categoria}\n🎨 Color: ${state.selectedColor.name}\n📏 Talle: ${state.selectedSize}\n💰 Precio de referencia: ${formatPrice(p.precio)}\n\n¿Podés confirmar disponibilidad?`;
    waLink.href    = createWhatsAppLink(msg);
    waLink.target  = '_blank';
    waLink.rel     = 'noopener';
    waLink.removeAttribute('disabled');
  } else if (waLink) {
    waLink.href = '#';
  }
}

/* ── Acciones ────────────────────────────────────── */
function setupActions() {
  const resetBtn  = document.querySelector('[data-reset-selection]');
  const customBtn = document.querySelector('[data-custom-request]');

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.selectedProduct = state.products[0] || null;
      state.selectedColor   = COLORS[0];
      state.selectedSize    = 'M';
      state.activeCategory  = 'Todos';
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
