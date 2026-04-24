import {
  loadProducts,
  formatPrice,
  createWhatsAppLink,
  renderDataNotice,
  escapeHtml,
  safeUrl,
  getProductUrl
} from './data-loader.js';

const state = {
  products: [],
  index: 0
};

function getFeaturedProducts(products) {
  const available = products.filter((p) => p && p.disponible);
  const featured = available.filter((p) => p.destacado);
  return (featured.length ? featured : available).slice(0, 12);
}

function renderProductCard(product) {
  const message = `Hola! Me interesa la remera **. ¿Está disponible?`;

  return `
    <article class="carousel-item" aria-hidden="true" hidden>
      <div class="product-card product-card--linked">
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

          <div class="product-actions">
            <a class="btn btn-secondary" href="${getProductUrl(product.id)}">
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

  dots.innerHTML = state.products
    .map(
      (_, index) => `
        <button
          type="button"
          class="carousel-dot${index === state.index ? ' is-active' : ''}"
          data-carousel-dot="${index}"
          aria-label="Ir al producto ${index + 1}"
          aria-current="${index === state.index ? 'true' : 'false'}"
        ></button>`
    )
    .join('');
}

function updateSlides(root) {
  const track = root.querySelector('[data-carousel-track]');
  const items = [...root.querySelectorAll('.carousel-item')];
  if (!track || !items.length) return;

  track.style.display = 'block';
  track.style.transform = 'none';
  track.style.width = '100%';

  items.forEach((item, index) => {
    const isActive = index === state.index;
    item.hidden = !isActive;
    item.setAttribute('aria-hidden', String(!isActive));
    item.style.display = isActive ? 'flex' : 'none';
  });
}

function updateControls(root) {
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');

  if (prevBtn) prevBtn.disabled = state.index === 0;
  if (nextBtn) nextBtn.disabled = state.index >= state.products.length - 1;

  renderDots(root);
  updateSlides(root);
}

function bindEvents(root) {
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  const dots = root.querySelector('[data-carousel-dots]');

  prevBtn?.addEventListener('click', () => {
    if (state.index > 0) {
      state.index -= 1;
      updateControls(root);
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (state.index < state.products.length - 1) {
      state.index += 1;
      updateControls(root);
    }
  });

  dots?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-carousel-dot]');
    if (!button) return;

    state.index = Number(button.getAttribute('data-carousel-dot')) || 0;
    updateControls(root);
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

  if (!state.products.length) {
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

  track.innerHTML = state.products.map(renderProductCard).join('');
  bindEvents(root);
  updateControls(root);
}

document.addEventListener('DOMContentLoaded', initCarousel);