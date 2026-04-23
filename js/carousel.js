import {
  loadProducts,
  formatPrice,
  createWhatsAppLink,
  renderDataNotice
} from './data-loader.js';

const state = {
  products: [],
  page: 0,
  perView: 1,
  totalPages: 1
};

function getPerView() {
  const width = window.innerWidth;

  if (width < 768) return 1;
  if (width < 1100) return 2;
  return 3;
}

function getFeaturedProducts(products) {
  const available = products.filter((product) => product && product.disponible);
  const featured = available.filter((product) => product.destacado);
  return (featured.length ? featured : available).slice(0, 9);
}

function renderProductCard(product) {
  const message = `Hola! Me interesa la remera *${product.nombre}*. ¿Está disponible?`;

  return `
    <article class="carousel-item">
      <div class="product-card product-card--linked card">
        <a class="product-card-link" href="producto.html?id=${product.id}" aria-label="Ver ${product.nombre}">
          <div class="product-media">
            <img src="${product.imagen}" alt="${product.nombre}" loading="lazy">
            ${product.destacado ? '<span class="cat-visual__badge">Destacado</span>' : ''}
          </div>
        </a>

        <div class="product-content">
          <div class="product-category">${product.categoria}</div>

          <h3 class="product-title">
            <a class="product-title-link" href="producto.html?id=${product.id}">
              ${product.nombre}
            </a>
          </h3>

          <p class="product-description">${product.descripcion}</p>

          <div class="price-row">
            <span class="product-price">${formatPrice(product.precio)}</span>
            <span class="tag">${product.disponible ? 'Disponible' : 'Consultar'}</span>
          </div>

          <div class="product-actions product-actions--spaced">
            <a class="btn btn-secondary" href="producto.html?id=${product.id}">
              Ver producto
            </a>
            <a class="btn btn-primary" href="${createWhatsAppLink(message)}" target="_blank" rel="noopener">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderDots(root) {
  const dots = root.querySelector('[data-carousel-dots]');
  if (!dots) return;

  dots.innerHTML = Array.from({ length: state.totalPages }, (_, index) => `
    <button
      type="button"
      class="carousel-dot ${index === state.page ? 'is-active' : ''}"
      data-carousel-dot="${index}"
      aria-label="Ir al grupo ${index + 1}"
      aria-current="${index === state.page ? 'true' : 'false'}"
    ></button>
  `).join('');
}

function updateControls(root) {
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');

  if (prevBtn) prevBtn.disabled = state.page === 0;
  if (nextBtn) nextBtn.disabled = state.page >= state.totalPages - 1;
}

function updateLayout(root) {
  const wrap = root.querySelector('.carousel-track-wrap');
  const track = root.querySelector('[data-carousel-track]');
  const items = [...root.querySelectorAll('.carousel-item')];

  if (!wrap || !track || !items.length) return;

  state.perView = Math.min(getPerView(), items.length);
  state.totalPages = Math.max(1, Math.ceil(items.length / state.perView));
  state.page = Math.min(state.page, state.totalPages - 1);

  const gap = parseFloat(getComputedStyle(track).gap || '0') || 0;
  const wrapWidth = wrap.clientWidth;
  const itemWidth = (wrapWidth - gap * (state.perView - 1)) / state.perView;

  items.forEach((item) => {
    item.style.flex = `0 0 ${itemWidth}px`;
    item.style.width = `${itemWidth}px`;
    item.style.maxWidth = `${itemWidth}px`;
  });

  const targetIndex = state.page * state.perView;
  const targetItem = items[targetIndex];

  if (targetItem) {
    const baseLeft = items[0].offsetLeft;
    const targetLeft = targetItem.offsetLeft;
    const offset = Math.max(0, targetLeft - baseLeft);
    track.style.transform = `translateX(-${offset}px)`;
  } else {
    track.style.transform = 'translateX(0)';
  }

  renderDots(root);
  updateControls(root);
}

function bindEvents(root) {
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  const dots = root.querySelector('[data-carousel-dots]');

  prevBtn?.addEventListener('click', () => {
    if (state.page > 0) {
      state.page -= 1;
      updateLayout(root);
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (state.page < state.totalPages - 1) {
      state.page += 1;
      updateLayout(root);
    }
  });

  dots?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-carousel-dot]');
    if (!button) return;

    state.page = Number(button.dataset.carouselDot || 0);
    updateLayout(root);
  });

  let resizeTimer = null;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateLayout(root);
    }, 80);
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
    'No se pudieron cargar los productos destacados. Se está mostrando la versión disponible.'
  );

  const featuredProducts = getFeaturedProducts(state.products);

  if (!featuredProducts.length) {
    track.innerHTML = `
      <div class="empty-state">
        <h3>No hay productos destacados por el momento</h3>
        <p>Probá entrando al catálogo completo para ver todos los diseños.</p>
      </div>
    `;

    root.querySelector('[data-carousel-prev]')?.setAttribute('hidden', 'true');
    root.querySelector('[data-carousel-next]')?.setAttribute('hidden', 'true');
    return;
  }

  track.innerHTML = featuredProducts.map(renderProductCard).join('');
  bindEvents(root);
  updateLayout(root);
}

document.addEventListener('DOMContentLoaded', initCarousel);