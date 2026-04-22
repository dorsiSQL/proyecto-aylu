const CART_STORAGE_KEY = 'retro_remeras_cart';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupDynamicYear();
  setupCategoryLinks();
  updateGlobalCartBadge();
  window.addEventListener('storage', updateGlobalCartBadge);
});

function setupMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  const navCta = document.querySelector('[data-nav-cta]');

  if (!toggle || !navLinks || !navCta) return;

  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
    navCta.classList.toggle('is-open', open);
  });

  [...navLinks.querySelectorAll('a'), ...navCta.querySelectorAll('a')].forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
      navCta.classList.remove('is-open');
    });
  });
}

function setupDynamicYear() {
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function setupCategoryLinks() {
  document.querySelectorAll('[data-category-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const category = link.getAttribute('data-category-link');
      if (!category) return;
      link.setAttribute('href', `catalogo.html?categoria=${encodeURIComponent(category)}`);
    });
  });
}

function updateGlobalCartBadge() {
  const count = getStoredCartCount();
  document.querySelectorAll('[data-global-cart-count]').forEach((node) => {
    node.textContent = count;
  });
}

function getStoredCartCount() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return 0;
    return parsed.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  } catch {
    return 0;
  }
}