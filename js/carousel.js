import { loadProducts, formatPrice, createWhatsAppLink, renderDataNotice } from './data-loader.js';

document.addEventListener('DOMContentLoaded', initCarousel);

async function initCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;

  const track = root.querySelector('[data-carousel-track]');
  const dotsWrap = root.querySelector('[data-carousel-dots]');
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');

  if (!track) return;

  try {
    const products = await loadProducts();

    renderDataNotice(
      root.querySelector('.container') || root,
      'products',
      'No se pudo cargar el carrusel remoto. Se está mostrando contenido de respaldo.'
    );

    if (!products.length) {
      track.innerHTML = `
        <div class="empty-state">
          <h3>No pudimos cargar el catálogo destacado</h3>
          <p>Probá recargando la página en unos segundos.</p>
        </div>
      `;
      return;
    }

    const carouselProducts = products;

    track.innerHTML = carouselProducts.map((product) => {
      const message = `Hola! Me interesa la remera ${product.nombre}. ¿Está disponible?`;

      return `
        <div class="carousel-item">
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
              </div>

              <div class="product-actions product-actions--compact">
                <a class="btn btn-secondary" href="producto.html?id=${product.id}">
                  Ver producto
                </a>
                <a class="btn btn-primary" href="${createWhatsAppLink(message)}" target="_blank" rel="noopener">
                  WhatsApp
                </a>
              </div>
            </div>
          </article>
        </div>
      `;
    }).join('');

    let index = 0;
    let timer = null;
    let resizeRaf = null;

    function perView() {
      if (window.innerWidth >= 1100) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function maxIndex() {
      return Math.max(0, carouselProducts.length - perView());
    }

    function setWidths() {
      const visible = perView();
      const gap = 12;
      const items = track.querySelectorAll('.carousel-item');

      items.forEach((item) => {
        item.style.flex = `0 0 calc((100% - ${(visible - 1) * gap}px) / ${visible})`;
      });
    }

    function renderDots() {
      if (!dotsWrap) return;

      const visible = perView();
      const pages = Math.max(1, Math.ceil(carouselProducts.length / visible));

      dotsWrap.innerHTML = '';

      for (let i = 0; i < pages; i += 1) {
        const button = document.createElement('button');
        button.className = `carousel-dot ${i === 0 ? 'is-active' : ''}`;
        button.setAttribute('data-page', String(i));
        button.setAttribute('aria-label', `Página ${i + 1}`);
        dotsWrap.appendChild(button);
      }
    }

    function goTo(nextIndex) {
      index = Math.max(0, Math.min(nextIndex, maxIndex()));

      const visible = perView();
      const gap = 12;
      const itemWidth = track.querySelector('.carousel-item')?.offsetWidth || 0;
      const offset = index * (itemWidth + gap);

      track.style.transform = `translateX(-${offset}px)`;

      if (dotsWrap) {
        const currentPage = Math.floor(index / visible);
        dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, dotIndex) => {
          dot.classList.toggle('is-active', dotIndex === currentPage);
        });
      }

      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex();
    }

    function startAutoplay() {
      stopAutoplay();

      timer = setInterval(() => {
        if (index >= maxIndex()) {
          goTo(0);
        } else {
          goTo(index + 1);
        }
      }, 4200);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (dotsWrap) {
      dotsWrap.addEventListener('click', (event) => {
        const button = event.target.closest('[data-page]');
        if (!button) return;

        const page = Number(button.getAttribute('data-page')) || 0;
        goTo(page * perView());
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goTo(index - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goTo(index + 1);
      });
    }

    const outer = root.querySelector('.carousel-outer');

    if (outer) {
      outer.addEventListener('mouseenter', stopAutoplay);
      outer.addEventListener('mouseleave', startAutoplay);
    }

    window.addEventListener('resize', () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);

      resizeRaf = requestAnimationFrame(() => {
        const pages = Math.max(1, Math.ceil(carouselProducts.length / perView()));
        const currentPage = Math.min(Math.floor(index / perView()), pages - 1);
        setWidths();
        renderDots();
        goTo(currentPage * perView());
      });
    });

    setWidths();
    renderDots();
    goTo(0);
    startAutoplay();
  } catch (error) {
    console.error('Error inicializando carrusel:', error);

    track.innerHTML = `
      <div class="empty-state">
        <h3>No pudimos cargar el carrusel</h3>
        <p>Revisá la consola del navegador o recargá la página.</p>
      </div>
    `;
  }
}