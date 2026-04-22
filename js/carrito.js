import { formatPrice, createWhatsAppLink } from './data-loader.js';

const STORAGE_KEY = 'retro_remeras_cart';

const state = {
  cart: loadCart()
};

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  setupActions();
  updateOrderLink();
  updateGlobalCartBadge();
});

function setupActions() {
  const clearBtn = document.querySelector('[data-clear-cart]');
  clearBtn?.addEventListener('click', clearCart);
}

function renderCart() {
  const list = document.querySelector('[data-cart-list]');
  const totalNode = document.querySelector('[data-cart-total]');
  const countNode = document.querySelector('[data-cart-items-count]');

  if (!list || !totalNode || !countNode) return;

  if (!state.cart.length) {
    list.innerHTML = `
      <div class="cart-empty-state">
        Todavía no agregaste productos al pedido.
      </div>
    `;
  } else {
    list.innerHTML = state.cart.map((item) => `
      <article class="cart-item" data-cart-id="${item.id}">
        <div class="cart-item-head">
          <div class="cart-item-copy">
            <h4>${item.productName}</h4>
            <p>${item.category}</p>
          </div>
          <strong class="cart-item-subtotal">${formatPrice(item.unitPrice * item.quantity)}</strong>
        </div>

        <ul class="cart-item-meta">
          <li><span>Tipo</span><strong>${item.fitLabel}</strong></li>
          <li><span>Color</span><strong>${item.color}</strong></li>
          <li><span>Talle</span><strong>${item.size}</strong></li>
          <li><span>Precio unit.</span><strong>${formatPrice(item.unitPrice)}</strong></li>
        </ul>

        <div class="cart-item-actions">
          <div class="qty-control" aria-label="Cantidad del producto">
            <button type="button" class="qty-btn" data-cart-action="decrease" data-cart-id="${item.id}" aria-label="Restar cantidad">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button type="button" class="qty-btn" data-cart-action="increase" data-cart-id="${item.id}" aria-label="Sumar cantidad">+</button>
          </div>

          <button type="button" class="cart-remove-btn" data-cart-action="remove" data-cart-id="${item.id}">
            Quitar
          </button>
        </div>
      </article>
    `).join('');
  }

  totalNode.textContent = formatPrice(getCartTotal());
  countNode.textContent = getCartItemsCount();

  list.querySelectorAll('[data-cart-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-cart-action');
      const id = btn.getAttribute('data-cart-id');
      handleCartAction(action, id);
    });
  });
}

function handleCartAction(action, id) {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;

  if (action === 'increase') {
    item.quantity += 1;
  }

  if (action === 'decrease') {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter((entry) => entry.id !== id);
    }
  }

  if (action === 'remove') {
    state.cart = state.cart.filter((entry) => entry.id !== id);
  }

  saveCart();
  renderCart();
  updateOrderLink();
  updateGlobalCartBadge();
}

function clearCart() {
  state.cart = [];
  saveCart();
  renderCart();
  updateOrderLink();
  updateGlobalCartBadge();
}

function updateOrderLink() {
  const link = document.querySelector('[data-whatsapp-order]');
  if (!link) return;

  link.href = createWhatsAppLink(buildWhatsAppMessage());
  link.target = '_blank';
  link.rel = 'noopener';
}

function buildWhatsAppMessage() {
  if (!state.cart.length) {
    return 'Hola! Quiero consultar por una remera.';
  }

  let msg = 'Hola! Quiero hacer un pedido:\n\n';

  state.cart.forEach((item, index) => {
    msg += `${index + 1}) ${item.productName}\n`;
    msg += `🏷️ Categoría: ${item.category}\n`;
    msg += `🧵 Tipo: ${item.fitLabel}\n`;
    msg += `📏 Talle: ${item.size}\n`;
    msg += `🎨 Color: ${item.color}\n`;
    msg += `🔢 Cantidad: ${item.quantity}\n`;
    msg += `💰 Subtotal ref.: ${formatPrice(item.unitPrice * item.quantity)}\n\n`;
  });

  msg += `💵 Total estimado: ${formatPrice(getCartTotal())}\n\n`;
  msg += '¿Podés confirmar disponibilidad?';
  return msg;
}

function updateGlobalCartBadge() {
  const count = getCartItemsCount();
  document.querySelectorAll('[data-global-cart-count]').forEach((node) => {
    node.textContent = count;
  });
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
}

function getCartTotal() {
  return state.cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
}

function getCartItemsCount() {
  return state.cart.reduce((acc, item) => acc + item.quantity, 0);
}