import { cart, subscribeToCartUpdates } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupDynamicYear();
  setupLandingScrollAnimations();
  updateGlobalCartBadge(cart.load());
  subscribeToCartUpdates(updateGlobalCartBadge);
});

function setupMobileMenu() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  const navCta = document.querySelector('[data-nav-cta]');

  if (!navbar || !toggle || !navLinks || !navCta) return;

  const desktopBreakpoint = window.matchMedia('(min-width: 1100px)');

  function closeMenu() {
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    navCta.classList.remove('is-open');
    navbar.style.setProperty('--mobile-nav-cta-offset', '0px');
  }

  function updateOffsets() {
    if (desktopBreakpoint.matches) {
      navbar.style.setProperty('--mobile-nav-cta-offset', '0px');
      return;
    }

    const linksHeight = navLinks.classList.contains('is-open') ? navLinks.offsetHeight : 0;
    const offset = linksHeight + 12;
    navbar.style.setProperty('--mobile-nav-cta-offset', `${offset}px`);
  }

  function openMenu() {
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('is-open');
    updateOffsets();
    navCta.classList.add('is-open');
  }

  toggle.addEventListener('click', () => {
    if (desktopBreakpoint.matches) return;

    const isOpen = toggle.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  [...navLinks.querySelectorAll('a'), ...navCta.querySelectorAll('a')].forEach((link) => {
    link.addEventListener('click', () => {
      if (!desktopBreakpoint.matches) closeMenu();
    });
  });

  function syncResponsiveState() {
    if (desktopBreakpoint.matches) {
      closeMenu();
      navLinks.classList.remove('is-open');
      navCta.classList.remove('is-open');
      return;
    }

    if (toggle.classList.contains('is-open')) {
      updateOffsets();
    }
  }

  if (typeof desktopBreakpoint.addEventListener === 'function') {
    desktopBreakpoint.addEventListener('change', syncResponsiveState);
  } else if (typeof desktopBreakpoint.addListener === 'function') {
    desktopBreakpoint.addListener(syncResponsiveState);
  }

  window.addEventListener('resize', syncResponsiveState);
  window.addEventListener('orientationchange', syncResponsiveState);

  syncResponsiveState();
}

function setupDynamicYear() {
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function updateGlobalCartBadge(items = []) {
  const count = cart.getItemsCount(items);
  document.querySelectorAll('[data-global-cart-count]').forEach((node) => {
    node.textContent = count;
  });
}

function setupLandingScrollAnimations() {
  const homePage = document.body.classList.contains('home-page');
  if (!homePage) return;

  const animatedElements = document.querySelectorAll(`
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

  if (!animatedElements.length) return;

  animatedElements.forEach((element, index) => {
    element.classList.add('scroll-reveal');
    element.style.setProperty('--reveal-delay', `${Math.min(index * 40, 240)}ms`);
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
      threshold: 0.16,
      rootMargin: '0px 0px -70px 0px'
    }
  );

  animatedElements.forEach((element) => observer.observe(element));
}