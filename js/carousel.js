import { loadProducts, formatPrice, createWhatsAppLink } from './data-loader.js';

function buildCardHTML(product) {
  const waMsg = `Hola! Me interesa la remera *${product.nombre}*. ¿Está disponible?`;

  return `
    <article class="product-card product-card--linked">
      <a class="product-card-link" href="producto.html?id=${product.id}" aria-label="Ver ${product.nombre}">
        <div class="product-media">
          <img src="${product.imagen}" alt="${product.nombre}">
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
          ${product.destacado ? '<span class="tag tag--gold">Destacado</span>' : ''}
        </div>

        <div class="product-actions" style="margin-top:.85rem;">
          <a class="btn btn-secondary" href="producto.html?id=${product.id}">
            Ver producto
          </a>
          <a class="btn btn-primary"
             href="${createWhatsAppLink(waMsg)}"
             target="_blank" rel="noopener">
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;

  const track = root.querySelector('[data-carousel-track]');
  const dotsWrap = root.querySelector('[data-carousel-dots]');
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  if (!track) return;

  const products = await loadProducts();
  if (!products.length) return;

  track.innerHTML = products.map(p => `
    <div class="carousel-item">${buildCardHTML(p)}</div>
  `).join('');

  let idx = 0;

  function perView() {
    if (window.innerWidth >= 900) return 3;
    if (window.innerWidth >= 580) return 2;
    return 1;
  }

  function maxIdx() {
    return Math.max(0, products.length - perView());
  }

  function setWidths() {
    const pv = perView();
    track.querySelectorAll('.carousel-item').forEach(el => {
      el.style.flex = `0 0 calc(${100 / pv}% - ${(pv - 1) * 12 / pv}px)`;
    });
  }

  function goTo(n) {
    idx = Math.max(0, Math.min(n, maxIdx()));
    const pv = perView();
    const itemW = 100 / pv;
    track.style.transform = `translateX(calc(-${idx * itemW}% - ${idx * 12 / pv}px))`;

    if (dotsWrap) {
      const page = Math.floor(idx / pv);
      dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) =>
        d.classList.toggle('is-active', i === page)
      );
    }

    prevBtn && prevBtn.toggleAttribute('disabled', idx === 0);
    nextBtn && nextBtn.toggleAttribute('disabled', idx >= maxIdx());
  }

  if (dotsWrap) {
    const pages = Math.ceil(products.length / perView());
    dotsWrap.innerHTML = Array.from({ length: pages }, (_, i) =>
      `<button class="carousel-dot ${i === 0 ? 'is-active' : ''}" data-page="${i}" aria-label="Página ${i + 1}"></button>`
    ).join('');

    dotsWrap.addEventListener('click', e => {
      const btn = e.target.closest('[data-page]');
      if (btn) goTo(Number(btn.dataset.page) * perView());
    });
  }

  prevBtn?.addEventListener('click', () => goTo(idx - perView()));
  nextBtn?.addEventListener('click', () => goTo(idx + perView()));

  let timer = setInterval(() => goTo(idx >= maxIdx() ? 0 : idx + perView()), 4200);
  const outer = root.querySelector('.carousel-outer');

  outer?.addEventListener('mouseenter', () => clearInterval(timer));
  outer?.addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo(idx >= maxIdx() ? 0 : idx + perView()), 4200);
  });

  window.addEventListener('resize', () => {
    setWidths();
    goTo(idx);
  });

  setWidths();
  goTo(0);
});