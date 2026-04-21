import { loadProducts, formatPrice, normalizeText } from './data-loader.js';

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

  pills.innerHTML = categories.map((category) => `
    <button class="filter-pill ${category === 'Todos' ? 'is-active' : ''}" type="button" data-filter-category="${category}">
      ${category}
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
    button.classList.toggle('is-active', button.getAttribute('data-filter-category') === state.activeCategory);
  });
}

function filterProducts() {
  const searchText = normalizeText(state.search);

  state.filteredProducts = state.products.filter((product) => {
    const matchesCategory = state.activeCategory === 'Todos' || product.categoria === state.activeCategory;
    const haystack = normalizeText(`${product.nombre} ${product.categoria} ${product.descripcion}`);
    const matchesSearch = !searchText || haystack.includes(searchText);
    return matchesCategory && matchesSearch && product.disponible;
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
  grid.querySelectorAll('[data-open-detail]').forEach((button) => {
    button.addEventListener('click', () => openDetail(button.getAttribute('data-open-detail')));
  });
}

function renderStats() {
  const totalNode = document.querySelector('[data-results-count]');
  const filterNode = document.querySelector('[data-results-filter]');

  if (totalNode) totalNode.textContent = `${state.filteredProducts.length} diseño${state.filteredProducts.length === 1 ? '' : 's'}`;
  if (filterNode) filterNode.textContent = state.activeCategory === 'Todos' ? 'Todas las categorías' : state.activeCategory;
}

function renderProductCard(product) {
  return `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.imagen}" alt="${product.nombre}" loading="lazy">
      </div>
      <div class="product-content">
        <div class="product-category">${product.categoria}</div>
        <h3 class="product-title">${product.nombre}</h3>
        <p class="product-description">${product.descripcion}</p>
        <div class="price-row">
          <span class="product-price">${formatPrice(product.precio)}</span>
          <span class="tag">${product.destacado ? 'Destacado' : 'Disponible'}</span>
        </div>
        <div class="product-actions" style="margin-top: 1rem;">
          <button class="btn btn-secondary" type="button" data-open-detail="${product.id}">Ver detalle</button>
          <a class="btn btn-primary" href="personalizar.html?producto=${product.id}">Personalizar</a>
        </div>
      </div>
    </article>
  `;
}

function setupModal() {
  const modal = document.querySelector('[data-product-modal]');
  if (!modal) return;

  modal.addEventListener('click', (event) => {
    if (event.target.matches('[data-close-modal], .modal-backdrop')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

function openDetail(productId) {
  const modal = document.querySelector('[data-product-modal]');
  const body = document.querySelector('[data-modal-body]');
  if (!modal || !body) return;

  const product = state.products.find((item) => String(item.id) === String(productId));
  if (!product) return;

  body.innerHTML = `
    <div class="modal-grid">
      <div class="product-media">
        <img src="${product.imagen}" alt="${product.nombre}">
      </div>
      <div class="modal-copy">
        <div class="product-category">${product.categoria}</div>
        <h3 class="section-title" style="font-size: 2.3rem;">${product.nombre}</h3>
        <p class="section-subtitle">${product.descripcion}</p>

        <div class="panel" style="margin-top: 1rem;">
          <div class="price-row">
            <span class="product-price">${formatPrice(product.precio)}</span>
            <span class="tag">${product.disponible ? 'Stock disponible' : 'Consultar disponibilidad'}</span>
          </div>
        </div>

        <div class="notice" style="margin-top: 1rem;">
          Este diseño se puede adaptar a distintos colores y talles. Si querés una variante, pasá a personalización.
        </div>

        <div class="hero-actions" style="margin-top: 1rem;">
          <a class="btn btn-primary" href="personalizar.html?producto=${product.id}">Personalizar este diseño</a>
          <button class="btn btn-secondary" type="button" data-close-modal>Cerrar</button>
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