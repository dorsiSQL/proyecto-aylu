import { cart, subscribeToCartUpdates } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupDynamicYear();
  updateGlobalCartBadge(cart.load());
  subscribeToCartUpdates(updateGlobalCartBadge);
});

function setupMobileMenu() {
  const header = document.querySelector('.topbar');
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  const navCta = document.querySelector('[data-nav-cta]');

  if (!toggle || !navLinks || !navCta || !navbar) return;

  const desktopBreakpoint = window.matchMedia('(min-width: 1024px)');

  function updateMobileNavOffset() {
    if (desktopBreakpoint.matches) {
      navbar.style.removeProperty('--mobile-nav-cta-offset');
      return;
    }

    const gap = 8;
    const linksHeight = navLinks.offsetHeight || 0;
    const offset = linksHeight + gap * 2;
    navbar.style.setProperty('--mobile-nav-cta-offset', `${offset}px`);
  }

  function closeMenu() {
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    navCta.classList.remove('is-open');
  }

  function openMenu() {
    navLinks.classList.add('is-open');
    updateMobileNavOffset();
    navCta.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.contains('is-open');

    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  });

  [...navLinks.querySelectorAll('a'), ...navCta.querySelectorAll('a')].forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  const handleResize = () => {
    if (desktopBreakpoint.matches) {
      closeMenu();
      navbar.style.removeProperty('--mobile-nav-cta-offset');
      return;
    }

    if (toggle.classList.contains('is-open')) {
      updateMobileNavOffset();
    }
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  updateMobileNavOffset();
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