import {
  loadProducts,
  formatPrice,
  createWhatsAppLink,
  renderDataNotice
} from './data-loader.js';

const state = {
  products: [],
  index: 0,
  perView: 1
};

function getPerView() {
  const width = window.innerWidth;

  if (width < 768) return 1;
  if (width < 1100) return 2;
  return 3;
}

function getFeaturedProducts(products) {
  const available = products.filter(p => p && p.disponible);
  const featured = available.filter(p => p.destacado);
  return (featured.length ? featured : available).slice(0, 12);
}

function renderProductCard(product) {
  const message = `Hola! Me interesa la remera *${product.nombre}*. ¿Está disponible?`;

  return `
    <article class="carousel-item">
      <div class="product-card product-card--linked card">
        <a class="product-card-link" href="producto.html?id=${product.id}">
          <div class="product-media">
            <img src="${product.imagen}" alt="${product.nombre}" loading="lazy">
            ${product.destacado ? '<span class="cat-visual__badge">Destacado</span>' : ''}
          </div>
        </a>

        <div class="product-content">
          <div class="product-category">${product.categoria}</div>

          <h3 class="product-title">
            <a href="producto.html?id=${product.id}">
              ${product.nombre}
            </a>
          </h3>

          <p class="product-description">${product.descripcion}</p>

          <div class="price-row">
            <span class="product-price">${formatPrice(product.precio)}</span>
            <span class="tag">${product.disponible ? 'Disponible' : 'Consultar'}</span>
          </div>

          <div class="product-actions">
            <a class="btn btn-secondary" href="producto.html?id=${product.id}">
              Ver producto
            </a>
            <a class="btn btn-primary" href="${createWhatsAppLink(message)}" target="_blank">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function scrollToIndex(root) {
  const items = root.querySelectorAll('.carousel-item');
  const target = items[state.index];

  if (!target) return;

  target.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest'
  });
}

function updateControls(root) {
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  const items = root.querySelectorAll('.carousel-item');

  if (prevBtn) prevBtn.disabled = state.index === 0;
  if (nextBtn) nextBtn.disabled = state.index >= items.length - state.perView;
}

function bindEvents(root) {
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');

  prevBtn?.addEventListener('click', () => {
    if (state.index > 0) {
      state.index--;
      scrollToIndex(root);
      updateControls(root);
    }
  });

  nextBtn?.addEventListener('click', () => {
    const items = root.querySelectorAll('.carousel-item');

    if (state.index < items.length - state.perView) {
      state.index++;
      scrollToIndex(root);
      updateControls(root);
    }
  });

  window.addEventListener('resize', () => {
    state.perView = getPerView();
    scrollToIndex(root);
    updateControls(root);
  });
}

async function initCarousel() {
  const root = document.querySelector('[data-carousel]');
  const track = root?.querySelector('[data-carousel-track]');

  if (!root || !track) return;

  state.products = await loadProducts();

  renderDataNotice(
    root.querySelector('.container'),
    'products',
    'No se pudieron cargar los productos.'
  );

  const featured = getFeaturedProducts(state.products);

  track.innerHTML = featured.map(renderProductCard).join('');

  state.perView = getPerView();

  bindEvents(root);
  updateControls(root);
}

document.addEventListener('DOMContentLoaded', initCarousel);