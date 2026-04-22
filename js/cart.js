import { formatPrice } from './data-loader.js';

const STORAGE_KEY = 'retro_remeras_cart';
const CART_UPDATED_EVENT = 'retro-cart:updated';

function safeParseCart(rawValue) {
  try {
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function emitCartUpdate(items) {
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: { items: Array.isArray(items) ? items : [] }
    })
  );
}

export const cart = {
  storageKey: STORAGE_KEY,
  updatedEvent: CART_UPDATED_EVENT,

  load() {
    return safeParseCart(localStorage.getItem(STORAGE_KEY));
  },

  save(items) {
    const safeItems = Array.isArray(items) ? items : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeItems));
    emitCartUpdate(safeItems);
    return safeItems;
  },

  clear() {
    return this.save([]);
  },

  createItemId(productId, color, size, fit) {
    return `${productId}-${color}-${size}-${fit}`;
  },

  addItem(items, nextItem) {
    const cartItems = Array.isArray(items) ? [...items] : [];
    const existing = cartItems.find((item) => item.id === nextItem.id);

    if (existing) {
      existing.quantity += Number(nextItem.quantity) || 1;
      return cartItems;
    }

    cartItems.push({
      ...nextItem,
      quantity: Number(nextItem.quantity) || 1
    });

    return cartItems;
  },

  changeQuantity(items, id, delta) {
    const cartItems = Array.isArray(items) ? [...items] : [];
    const item = cartItems.find((entry) => entry.id === id);

    if (!item) return cartItems;

    item.quantity += Number(delta) || 0;

    if (item.quantity <= 0) {
      return cartItems.filter((entry) => entry.id !== id);
    }

    return cartItems;
  },

  removeItem(items, id) {
    const cartItems = Array.isArray(items) ? items : [];
    return cartItems.filter((entry) => entry.id !== id);
  },

  getTotal(items) {
    const cartItems = Array.isArray(items) ? items : [];
    return cartItems.reduce((acc, item) => {
      const unitPrice = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      return acc + (unitPrice * quantity);
    }, 0);
  },

  getItemsCount(items) {
    const cartItems = Array.isArray(items) ? items : [];
    return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  },

  buildMessage(items) {
    const cartItems = Array.isArray(items) ? items : [];

    if (!cartItems.length) {
      return 'Hola! Quiero consultar por una remera.';
    }

    let message = 'Hola! Quiero hacer un pedido:\n\n';

    cartItems.forEach((item, index) => {
      message += `${index + 1}) ${item.productName}\n`;
      message += `🏷️ Categoría: ${item.category}\n`;
      message += `🧵 Tipo: ${item.fitLabel}\n`;
      message += `📏 Talle: ${item.size}\n`;
      message += `🎨 Color: ${item.color}\n`;
      message += `🔢 Cantidad: ${item.quantity}\n`;
      message += `💰 Subtotal ref.: ${formatPrice((Number(item.unitPrice) || 0) * (Number(item.quantity) || 0))}\n\n`;
    });

    message += `💵 Total estimado: ${formatPrice(this.getTotal(cartItems))}\n\n`;
    message += '¿Podés confirmar disponibilidad?';

    return message;
  },

  createListMarkup(items) {
    const cartItems = Array.isArray(items) ? items : [];

    if (!cartItems.length) {
      return `
        <div class="cart-empty-state">
          Todavía no agregaste productos al pedido.
        </div>
      `;
    }

    return cartItems.map((item) => `
      <article class="cart-item" data-cart-id="${item.id}">
        <div class="cart-item-body">
          <div class="cart-item-thumb">
            <img src="${item.image || ''}" alt="${item.productName}">
          </div>

          <div class="cart-item-content">
            <div class="cart-item-head">
              <div class="cart-item-copy">
                <h4>${item.productName}</h4>
                <p>${item.category}</p>
              </div>
              <strong class="cart-item-subtotal">${formatPrice((Number(item.unitPrice) || 0) * (Number(item.quantity) || 0))}</strong>
            </div>

            <ul class="cart-item-meta">
              <li><span>Tipo</span><strong>${item.fitLabel}</strong></li>
              <li><span>Color</span><strong>${item.color}</strong></li>
              <li><span>Talle</span><strong>${item.size}</strong></li>
              <li><span>Precio unit.</span><strong>${formatPrice(Number(item.unitPrice) || 0)}</strong></li>
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
          </div>
        </div>
      </article>
    `).join('');
  }
};

export function subscribeToCartUpdates(callback) {
  if (typeof callback !== 'function') return () => {};

  const onStorage = (event) => {
    if (event.key && event.key !== STORAGE_KEY) return;
    callback(cart.load());
  };

  const onCustomUpdate = (event) => {
    callback(event.detail?.items || cart.load());
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(CART_UPDATED_EVENT, onCustomUpdate);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CART_UPDATED_EVENT, onCustomUpdate);
  };
}