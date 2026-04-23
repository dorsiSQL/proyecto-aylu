document.addEventListener('DOMContentLoaded', async () => {
  setupMobileMenu();
  setupDynamicYear();

  const cartApi = await loadCartApiSafely();
  updateGlobalCartBadge(cartApi, cartApi.load());

  if (typeof cartApi.subscribeToCartUpdates === 'function') {
    cartApi.subscribeToCartUpdates((items) => {
      updateGlobalCartBadge(cartApi, items);
    });
  }
});

async function loadCartApiSafely() {
  try {
    const module = await import('./cart.js');

    const cart = module.cart || {
      load: () => [],
      getItemsCount: (items = []) => Array.isArray(items) ? items.length : 0
    };

    const subscribeToCartUpdates =
      typeof module.subscribeToCartUpdates === 'function'
        ? module.subscribeToCartUpdates
        : null;

    return {
      cart,
      subscribeToCartUpdates,
      load: () => {
        try {
          return typeof cart.load === 'function' ? cart.load() : [];
        } catch (error) {
          console.warn('No se pudo cargar el carrito:', error);
          return [];
        }
      },
      getItemsCount: (items = []) => {
        try {
          if (typeof cart.getItemsCount === 'function') {
            return cart.getItemsCount(items);
          }
          return Array.isArray(items) ? items.length : 0;
        } catch (error) {
          console.warn('No se pudo calcular el contador del carrito:', error);
          return Array.isArray(items) ? items.length : 0;
        }
      }
    };
  } catch (error) {
    console.warn('cart.js no cargó correctamente. El menú mobile seguirá funcionando.', error);

    return {
      cart: null,
      subscribeToCartUpdates: null,
      load: () => [],
      getItemsCount: (items = []) => Array.isArray(items) ? items.length : 0
    };
  }
}

function setupMobileMenu() {
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

    const linksHeight = navLinks.offsetHeight || 0;
    const extraGap = 12;
    navbar.style.setProperty('--mobile-nav-cta-offset', `${linksHeight + extraGap}px`);
  }

  function closeMenu() {
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    navCta.classList.remove('is-open');
    updateMobileNavOffset();
  }

  function openMenu() {
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');

    navLinks.classList.add('is-open');
    updateMobileNavOffset();
    navCta.classList.add('is-open');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.contains('is-open');

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  [...navLinks.querySelectorAll('a'), ...navCta.querySelectorAll('a')].forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  function handleResponsiveState() {
    if (desktopBreakpoint.matches) {
      closeMenu();
      navbar.style.removeProperty('--mobile-nav-cta-offset');
      return;
    }

    if (toggle.classList.contains('is-open')) {
      updateMobileNavOffset();
    }
  }

  if (typeof desktopBreakpoint.addEventListener === 'function') {
    desktopBreakpoint.addEventListener('change', handleResponsiveState);
  } else if (typeof desktopBreakpoint.addListener === 'function') {
    desktopBreakpoint.addListener(handleResponsiveState);
  }

  window.addEventListener('resize', handleResponsiveState);
  window.addEventListener('orientationchange', handleResponsiveState);

  handleResponsiveState();
}

function setupDynamicYear() {
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function updateGlobalCartBadge(cartApi, items = []) {
  const count =
    cartApi && typeof cartApi.getItemsCount === 'function'
      ? cartApi.getItemsCount(items)
      : Array.isArray(items)
        ? items.length
        : 0;

  document.querySelectorAll('[data-global-cart-count]').forEach((node) => {
    node.textContent = count;
  });
}