import { loadProducts, formatPrice, normalizeText, createWhatsAppLink, renderDataNotice, escapeHtml, safeUrl, getProductUrl } from './data-loader.js';

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

  state.products = await loadProducts();
  renderDataNotice(
    document.querySelector('.catalog-shell'),
    'products',
    'No se pudo cargar el catálogo remoto. Se está mostrando una versión de respaldo.'
  );

  applyQueryParams();
  filterProducts();
});

function setupCategoryPills() {
  const pills = document.querySelector('[data-category-pills]');
  if (!pills) return;

  pills.innerHTML = categories.map((category) => `
    <button class="filter-pill ${category === 'Todos' ? 'is-active' : ''}" type="button" data-filter-category="${escapeHtml(category)}">
      ${escapeHtml(category)}
    </button>
  `).join('');

  pills.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter-category]');
    if (!button) return;

    state.activeCategory = button.getAttribute('data-filter-category') || 'Todos';
    syncActivePill();
    filterProducts();
  });
}

function setupSearch() {
  const input = document.querySelector('[data-search-input]');
  if (!input) return;

  input.addEventListener('input', (event) => {
    state.search = event.target.value;
    filterProducts();
  });
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('categoria');
  const search = params.get('buscar');

  if (category && categories.includes(category)) {
    state.activeCategory = category;
    syncActivePill();
  }

  if (search) {
    state.search = search;
    const input = document.querySelector('[data-search-input]');
    if (input) input.value = search;
  }
}

function syncActivePill() {
  document.querySelectorAll('[data-filter-category]').forEach((button) => {
    button.classList.toggle(
      'is-active',
      button.getAttribute('data-filter-category') === state.activeCategory
    );
  });
}

function filterProducts() {
  const searchText = normalizeText(state.search);

  state.filteredProducts = state.products.filter((product) => {
    const matchCategory = state.activeCategory === 'Todos' || product.categoria === state.activeCategory;
    const haystack = normalizeText(`  `);
    const matchSearch = !searchText || haystack.includes(searchText);

    return matchCategory && matchSearch && product.disponible;
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
  const message = `Hola! Me interesa la remera **. ¿Está disponible?`;

  return `
    <article class="product-card product-card--linked">
      <a class="product-card-link" href="${getProductUrl(product.id)}" aria-label="Ver ${escapeHtml(product.nombre)}">
        <div class="product-media">
          <img src="${safeUrl(product.imagen)}" alt="${escapeHtml(product.nombre)}" loading="lazy" decoding="async">
          ${product.destacado ? '<span class="cat-visual__badge">Destacado</span>' : ''}
        </div>
      </a>

      <div class="product-content">
        <div class="product-category">${escapeHtml(product.categoria)}</div>

        <h3 class="product-title">
          <a class="product-title-link" href="${getProductUrl(product.id)}">
            ${escapeHtml(product.nombre)}
          </a>
        </h3>

        <p class="product-description">${escapeHtml(product.descripcion)}</p>

        <div class="price-row">
          <span class="product-price">${formatPrice(product.precio)}</span>
          <span class="tag">${product.disponible ? 'Disponible' : 'Consultar'}</span>
        </div>

        <div class="product-actions product-actions--spaced">
          <a class="btn btn-secondary" href="${getProductUrl(product.id)}">
            Ver producto
          </a>
          <a class="btn btn-primary" href="${createWhatsAppLink(message)}" target="_blank" rel="noopener">
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  `;
}