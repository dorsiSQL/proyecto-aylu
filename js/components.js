function getCurrentPage() {
  const path = window.location.pathname.split('/').pop();
  return path || 'index.html';
}

function isActive(targetPage) {
  return getCurrentPage() === targetPage ? 'is-active' : '';
}

function navbarTemplate() {
  return `
    <header class="topbar">
      <div class="container navbar">
        <a class="brand" href="index.html" aria-label="Ir al inicio de Retro Remeras">
          <img src="assets/logo/icono-banner.png" alt="Retro Remeras">
        </a>

        <button class="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" data-menu-toggle>
          <span></span>
        </button>

        <nav class="nav-links" aria-label="Navegación principal" data-nav-links>
          <a class="${isActive('index.html')}" href="index.html">Inicio</a>
          <a class="${isActive('catalogo.html')}" href="catalogo.html">Catálogo</a>
          <a href="index.html#como-funciona">Cómo funciona</a>
          <a href="index.html#beneficios">Beneficios</a>
        </nav>

        <div class="nav-cta" data-nav-cta>
          <a class="nav-cart-icon-btn ${isActive('carrito.html')}" href="carrito.html" aria-label="Ver carrito">
            <img src="assets/icons/carrito-de-compras.png" alt="" class="nav-cart-icon" loading="lazy">
            <span class="nav-cart-badge nav-cart-badge--icon" data-global-cart-count>0</span>
          </a>

          <a class="btn btn-primary ${isActive('catalogo.html')}" href="catalogo.html">Ver catálogo</a>
        </div>
      </div>
    </header>
  `;
}

function footerTemplate() {
  return `
    <footer class="footer">
      <div class="container footer-grid">
        <div>
          <a class="brand" href="index.html" aria-label="Retro Remeras">
            <img src="assets/logo/icono-banner.png" alt="Retro Remeras" loading="lazy">
          </a>
          <p>Remeras con estilo, nostalgia y personalidad. Diseños temáticos, atención cercana y pedidos simples por WhatsApp.</p>
          <small>© <span data-year></span> Retro Remeras. Todos los derechos reservados.</small>
        </div>

        <div>
          <div class="footer-links">
            <span class="tag">Instagram: @retroremeras</span>
            <span class="tag">TikTok: @retroremeras</span>
            <span class="tag">WhatsApp: +54 9 11 5659-2963</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

class RetroNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = navbarTemplate();
  }
}

class RetroFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = footerTemplate();
  }
}

if (!customElements.get('retro-navbar')) {
  customElements.define('retro-navbar', RetroNavbar);
}

if (!customElements.get('retro-footer')) {
  customElements.define('retro-footer', RetroFooter);
}