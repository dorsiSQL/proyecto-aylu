import { cart, subscribeToCartUpdates } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  setupStickyNavbar();
  setupMobileMenu();
  setupDynamicYear();
  setupLandingScrollAnimations();
  updateGlobalCartBadge(cart.load());
  subscribeToCartUpdates(updateGlobalCartBadge);
});

/* =========================
   Navbar sticky PRO
========================= */
function setupStickyNavbar() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const syncScrollState = () => {
    document.body.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  syncScrollState();
  window.addEventListener('scroll', syncScrollState, { passive: true });
}

/* =========================
   Mobile menu
========================= */
function setupMobileMenu() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  const navCta = document.querySelector('[data-nav-cta]');

  if (!navbar || !toggle || !navLinks || !navCta) return;

  const desktopBreakpoint = window.matchMedia('(min-width: 1100px)');
  const backdrop = getOrCreateMenuBackdrop();

  function isOpen() {
    return toggle.classList.contains('is-open');
  }

  function setMenuState(open) {
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
    navCta.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-menu-open', open);

    if (open) {
      updateOffsets();
      return;
    }

    navbar.style.setProperty('--mobile-nav-cta-offset', '0px');
  }

  function closeMenu() {
    setMenuState(false);
  }

  function openMenu() {
    if (desktopBreakpoint.matches) return;
    setMenuState(true);
  }

  function updateOffsets() {
    if (desktopBreakpoint.matches) {
      navbar.style.setProperty('--mobile-nav-cta-offset', '0px');
      return;
    }

    const linksHeight = navLinks.classList.contains('is-open') ? navLinks.offsetHeight : 0;
    navbar.style.setProperty('--mobile-nav-cta-offset', `${linksHeight + 12}px`);
  }

  toggle.addEventListener('click', () => {
    if (desktopBreakpoint.matches) return;
    isOpen() ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  [...navLinks.querySelectorAll('a'), ...navCta.querySelectorAll('a')].forEach((link) => {
    link.addEventListener('click', () => {
      if (!desktopBreakpoint.matches) closeMenu();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (desktopBreakpoint.matches || !isOpen()) return;
    const clickedInsideNavbar = navbar.contains(event.target);
    const clickedBackdrop = backdrop.contains(event.target);
    if (!clickedInsideNavbar && !clickedBackdrop) closeMenu();
  });

  function syncResponsiveState() {
    if (desktopBreakpoint.matches) {
      closeMenu();
      return;
    }

    if (isOpen()) updateOffsets();
  }

  if (desktopBreakpoint.addEventListener) {
    desktopBreakpoint.addEventListener('change', syncResponsiveState);
  } else {
    desktopBreakpoint.addListener(syncResponsiveState);
  }

  window.addEventListener('resize', syncResponsiveState, { passive: true });
  window.addEventListener('orientationchange', syncResponsiveState);

  syncResponsiveState();
}

function getOrCreateMenuBackdrop() {
  const existing = document.querySelector('[data-nav-backdrop]');
  if (existing) return existing;

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'nav-menu-backdrop';
  backdrop.setAttribute('data-nav-backdrop', 'true');
  backdrop.setAttribute('aria-label', 'Cerrar menú');
  document.body.appendChild(backdrop);
  return backdrop;
}

/* =========================
   Año dinámico
========================= */
function setupDynamicYear() {
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

/* =========================
   Carrito (badge global)
========================= */
function updateGlobalCartBadge(items = []) {
  const count = cart.getItemsCount(items);
  document.querySelectorAll('[data-global-cart-count]').forEach((node) => {
    node.textContent = count;
    node.setAttribute('aria-label', `${count} productos en el carrito`);
  });
}

/* =========================
   Scroll reveal (landing)
========================= */
function setupLandingScrollAnimations() {
  const homePage = document.body.classList.contains('home-page');
  if (!homePage) return;

  const elements = document.querySelectorAll(`
    .hero-copy,
    .hero-visual,
    .section-header,
    .info-card,
    .category-card,
    .benefit-card,
    [data-carousel] .carousel-outer,
    [data-carousel] .carousel-dots,
    .footer-grid
  `);

  if (!elements.length) return;

  elements.forEach((el, index) => {
    el.classList.add('scroll-reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(index * 40, 240)}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  elements.forEach((el) => observer.observe(el));
}
