import { loadProducts, formatPrice, normalizeText, createWhatsAppLink } from './data-loader.js';

const state = {
  products: [],
  filteredProducts: [],
  activeCategory: 'Todos',
  search: ''
};

const categories = ['Todos', 'Fútbol', 'Anime', 'Cine / Películas', 'Videojuegos', 'Variados', 'Vintage'];

document.addEventListener('DOMContentLoaded', async () => {
  setupCategoryPills();
  setupSearch();
  setupModal();

  state.products = await loadProducts();
  applyQueryParams();
  filterProducts();
});

function setupCategoryPills() {
  const pills = document.querySelector('[data-category-pills]');
  if (!pills) return;

  pills.innerHTML = categories.map((cat) => `
    <button class="filter-pill ${cat === 'Todos' ? 'is-active' : ''}" type="button" data-filter-category="${cat}">
      ${cat}
    </button>
  `).join('');

  pills.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter-category]');
    if (!btn) return;
    state.activeCategory = btn.getAttribute('data-filter-category') || 'Todos';
    syncActivePill();
    filterProducts();
  });
}

function setupSearch() {
  const input = document.querySelector('[data-search-input]');
  if (!input) return;
  input.addEventListener('input', (e) => {
    state.search = e.target.value;
    filterProducts();
  });
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('categoria');
  const search = params.get('buscar');

  if (cat && categories.includes(cat)) {
    state.activeCategory = cat;
    syncActivePill();
  }

  if (search) {
    state.search = search;
    const inp = document.querySelector('[data-search-input]');
    if (inp) inp.value = search;
  }
}

function syncActivePill() {
  document.querySelectorAll('[data-filter-category]').forEach((btn) => {
    btn.classList.toggle(
      'is-active',
      btn.getAttribute('data-filter-category') === state.activeCategory
    );
  });
}

function filterProducts() {
  const txt = normalizeText(state.search);

  state.filteredProducts = state.products.filter((p) => {
    const matchCat = state.activeCategory === 'Todos' || p.categoria === state.activeCategory;
    const haystack = normalizeText(`${p.nombre} ${p.categoria} ${p.descripcion}`);
    const matchSearch = !txt || haystack.includes(txt);
    return matchCat && matchSearch && p.disponible;
  });

  renderCatalog();
  renderStats();
}

function renderCatalog() {
  const grid = document.querySelector('[data-catalog-grid]');
  if (!grid) return;

  if (!state.filteredProducts.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No encontramos resultados</h3>
        <p>Probá con otra categoría o cambiando el texto de búsqueda.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.filteredProducts.map(renderProductCard).join('');

  grid.querySelectorAll('[data-open-detail]').forEach((btn) => {
    btn.addEventListener('click', () => openDetail(btn.getAttribute('data-open-detail')));
  });
}

function renderStats() {
  const total = document.querySelector('[data-results-count]');
  const filter = document.querySelector('[data-results-filter]');

  if (total) {
    total.textContent = `${state.filteredProducts.length} diseño${state.filteredProducts.length === 1 ? '' : 's'}`;
  }

  if (filter) {
    filter.textContent = state.activeCategory === 'Todos' ? 'Todas las categorías' : state.activeCategory;
  }
}

function renderProductCard(product) {
  const waMsg = `Hola! Me interesa la remera *${product.nombre}*. ¿Está disponible?`;

  return `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.imagen}" alt="${product.nombre}">
        ${product.destacado ? '<span class="cat-visual__badge">Destacado</span>' : ''}
      </div>

      <div class="product-content">
        <div class="product-category">${product.categoria}</div>
        <h3 class="product-title">${product.nombre}</h3>
        <p class="product-description">${product.descripcion}</p>

        <div class="price-row">
          <span class="product-price">${formatPrice(product.precio)}</span>
          <span class="tag">${product.disponible ? 'Disponible' : 'Consultar'}</span>
        </div>

        <div class="product-actions" style="margin-top:1rem;">
          <button class="btn btn-secondary" type="button" data-open-detail="${product.id}">
            Ver detalle
          </button>
          <a class="btn btn-primary" href="${createWhatsAppLink(waMsg)}" target="_blank" rel="noopener">
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </article>
  `;
}

function setupModal() {
  const modal = document.querySelector('[data-product-modal]');
  if (!modal) return;

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-modal], .modal-backdrop')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openDetail(productId) {
  const modal = document.querySelector('[data-product-modal]');
  const body = document.querySelector('[data-modal-body]');
  if (!modal || !body) return;

  const product = state.products.find((p) => String(p.id) === String(productId));
  if (!product) return;

  const waMsg = `Hola! Me interesa la remera *${product.nombre}*. ¿Me podés dar info de talles y colores disponibles?`;

  body.innerHTML = `
    <div class="modal-grid">
      <div class="product-media cat-visual--modal">
        <img src="${product.imagen}" alt="${product.nombre}">
      </div>

      <div class="modal-copy">
        <div class="product-category">${product.categoria}</div>
        <h3 class="section-title" style="font-size:2.3rem;">${product.nombre}</h3>
        <p class="section-subtitle">${product.descripcion}</p>

        <div class="panel" style="margin-top:1rem;">
          <div class="price-row">
            <span class="product-price">${formatPrice(product.precio)}</span>
            <span class="tag">${product.disponible ? 'Stock disponible' : 'Consultar disponibilidad'}</span>
          </div>
        </div>

        <div class="notice" style="margin-top:1rem;">
          Este diseño se puede adaptar a distintos colores y talles. Pasá a personalización para armar tu pedido completo.
        </div>

        <div class="hero-actions" style="margin-top:1rem;">
          <a class="btn btn-primary" href="${createWhatsAppLink(waMsg)}" target="_blank" rel="noopener">
            Pedir por WhatsApp
          </a>
          <a class="btn btn-secondary" href="personalizar.html?producto=${product.id}">
            Personalizar
          </a>
          <button class="btn btn-ghost" type="button" data-close-modal>Cerrar</button>
        </div>
      </div>
    </div>
  `;

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.querySelector('[data-product-modal]');
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}