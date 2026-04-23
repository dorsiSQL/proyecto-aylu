import {
  loadProducts,
  formatPrice,
  createWhatsAppLink,
  renderDataNotice
} from './data-loader.js';

const state = {
  products: [],
  index: 0
};

function getFeaturedProducts(products) {
  const available = products.filter(p => p && p.disponible);
  const featured = available.filter(p => p.destacado);
  return (featured.length ? featured : available).slice(0, 12);
}

function renderProductCard(product) {
  const message = `Hola! Me interesa la remera *${product.nombre}*. ¿Está disponible?`;

  return `
    <article class="carousel-item">
      <div class="product-card">
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

function updateCarousel(root) {
  const track = root.querySelector('[data-carousel-track]');
  track.style.transform = `translateX(-${state.index * 100}%)`;
}

function updateControls(root) {
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');

  if (prevBtn) prevBtn.disabled = state.index === 0;
  if (nextBtn) nextBtn.disabled = state.index === state.products.length - 1;
}

function bindEvents(root) {
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');

  prevBtn?.addEventListener('click', () => {
    if (state.index > 0) {
      state.index--;
      updateCarousel(root);
      updateControls(root);
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (state.index < state.products.length - 1) {
      state.index++;
      updateCarousel(root);
      updateControls(root);
    }
  });
}

async function initCarousel() {
  const root = document.querySelector('[data-carousel]');
  const track = root?.querySelector('[data-carousel-track]');

  if (!root || !track) return;

  const products = await loadProducts();

  renderDataNotice(
    root.querySelector('.container'),
    'products',
    'No se pudieron cargar los productos.'
  );

  state.products = getFeaturedProducts(products);

  track.innerHTML = state.products.map(renderProductCard).join('');

  bindEvents(root);
  updateControls(root);
}

document.addEventListener('DOMContentLoaded', initCarousel);