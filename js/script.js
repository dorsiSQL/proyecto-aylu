import { createWhatsAppLink } from './data-loader.js';
import { cart } from './cart.js';

const state = {
  cart: cart.load()
};

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  setupActions();
  updateOrderLink();
});

function setupActions() {
  const clearBtn = document.querySelector('[data-clear-cart]');
  const list = document.querySelector('[data-cart-list]');

  clearBtn?.addEventListener('click', clearCart);

  list?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;

    const action = button.getAttribute('data-cart-action');
    const id = button.getAttribute('data-cart-id');
    handleCartAction(action, id);
  });
}

function renderCart() {
  const list = document.querySelector('[data-cart-list]');
  const totalNode = document.querySelector('[data-cart-total]');
  const countNode = document.querySelector('[data-cart-items-count]');

  if (!list || !totalNode || !countNode) return;

  list.innerHTML = cart.createListMarkup(state.cart);
  totalNode.textContent = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(cart.getTotal(state.cart));

  countNode.textContent = cart.getItemsCount(state.cart);
}

function handleCartAction(action, id) {
  if (!id) return;

  if (action === 'increase') {
    state.cart = cart.changeQuantity(state.cart, id, 1);
  }

  if (action === 'decrease') {
    state.cart = cart.changeQuantity(state.cart, id, -1);
  }

  if (action === 'remove') {
    state.cart = cart.removeItem(state.cart, id);
  }

  cart.save(state.cart);
  renderCart();
  updateOrderLink();
}

function clearCart() {
  state.cart = cart.clear();
  renderCart();
  updateOrderLink();
}

function updateOrderLink() {
  const link = document.querySelector('[data-whatsapp-order]');
  if (!link) return;

  link.href = createWhatsAppLink(cart.buildMessage(state.cart));
  link.target = '_blank';
  link.rel = 'noopener';
}