import { loadProducts, loadDesigns, createWhatsAppLink } from './data-loader.js';

const colors = [
  { name: 'Negro', hex: '#111111', text: '#f5ead4' },
  { name: 'Blanco', hex: '#efefef', text: '#111111' },
  { name: 'Rojo', hex: '#b22525', text: '#f5ead4' },
  { name: 'Amarillo', hex: '#e2b022', text: '#111111' },
  { name: 'Gris', hex: '#787878', text: '#f5ead4' }
];

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const state = {
  products: [],
  designs: [],
  selectedDesign: '',
  selectedColor: colors[0],
  selectedSize: 'M'
};

document.addEventListener('DOMContentLoaded', async () => {
  state.products = await loadProducts();
  state.designs = await loadDesigns();

  applyQueryParams();
  renderDesigns();
  renderColors();
  renderSizes();
  updateSummary();
  setupActions();
});

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('producto');
  const explicitDesign = params.get('diseno');

  if (explicitDesign) {
    state.selectedDesign = explicitDesign;
    return;
  }

  if (productId) {
    const product = state.products.find((item) => String(item.id) === String(productId));
    if (product) {
      state.selectedDesign = product.nombre;
      const designHint = document.querySelector('[data-design-hint]');
      if (designHint) {
        designHint.textContent = `Entraste desde el catálogo con: ${product.nombre}. Igual podés cambiarlo por otro diseño.`;
      }
      return;
    }
  }

  state.selectedDesign = state.designs[0]?.nombre || 'Tipografía Retro Remeras';
}

function renderDesigns() {
  const container = document.querySelector('[data-design-grid]');
  if (!container) return;

  container.innerHTML = state.designs.map((design) => `
    <button class="design-card ${state.selectedDesign === design.nombre ? 'is-selected' : ''}" type="button" data-design-name="${design.nombre}">
      <img src="${design.thumb}" alt="${design.nombre}" loading="lazy">
      <div class="design-card-content">
        <h3>${design.nombre}</h3>
        <p class="section-subtitle">${design.descripcion}</p>
      </div>
    </button>
  `).join('');

  container.querySelectorAll('[data-design-name]').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedDesign = card.getAttribute('data-design-name') || '';
      renderDesigns();
      updateSummary();
    });
  });
}

function renderColors() {
  const container = document.querySelector('[data-color-swatches]');
  if (!container) return;

  container.innerHTML = colors.map((color) => `
    <label class="swatch ${state.selectedColor.name === color.name ? 'is-selected' : ''}">
      <input type="radio" name="shirt-color" value="${color.name}" ${state.selectedColor.name === color.name ? 'checked' : ''}>
      <span class="swatch-dot" style="background:${color.hex}"></span>
      <span>${color.name}</span>
    </label>
  `).join('');

  container.querySelectorAll('input[name="shirt-color"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedColor = colors.find((item) => item.name === input.value) || colors[0];
      renderColors();
      updateSummary();
    });
  });
}

function renderSizes() {
  const container = document.querySelector('[data-size-grid]');
  if (!container) return;

  container.innerHTML = sizes.map((size) => `
    <label class="size-option ${state.selectedSize === size ? 'is-selected' : ''}">
      <input type="radio" name="shirt-size" value="${size}" ${state.selectedSize === size ? 'checked' : ''}>
      <span>${size}</span>
    </label>
  `).join('');

  container.querySelectorAll('input[name="shirt-size"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedSize = input.value;
      renderSizes();
      updateSummary();
    });
  });
}

function updateSummary() {
  const designNode = document.querySelector('[data-summary-design]');
  const colorNode = document.querySelector('[data-summary-color]');
  const sizeNode = document.querySelector('[data-summary-size]');
  const shirt = document.querySelector('[data-shirt-preview]');
  const shirtText = document.querySelector('[data-shirt-text]');
  const whatsapp = document.querySelector('[data-whatsapp-link]');

  if (designNode) designNode.textContent = state.selectedDesign || 'Sin seleccionar';
  if (colorNode) colorNode.textContent = state.selectedColor.name;
  if (sizeNode) sizeNode.textContent = state.selectedSize;

  if (shirt) {
    shirt.style.setProperty('--shirt-color', state.selectedColor.hex);
    shirt.style.setProperty('--shirt-text-color', state.selectedColor.text);
  }

  if (shirtText) {
    shirtText.innerHTML = (state.selectedDesign || 'Diseño').split(' ').slice(0, 3).join('<br>');
  }

  if (whatsapp) {
    const message = `Hola, quiero este diseño: ${state.selectedDesign}, color: ${state.selectedColor.name}, talle: ${state.selectedSize}.`;
    whatsapp.href = createWhatsAppLink(message);
  }
}

function setupActions() {
  const resetButton = document.querySelector('[data-reset-selection]');
  const customButton = document.querySelector('[data-custom-request]');

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      state.selectedDesign = state.designs[0]?.nombre || 'Tipografía Retro Remeras';
      state.selectedColor = colors[0];
      state.selectedSize = 'M';
      renderDesigns();
      renderColors();
      renderSizes();
      updateSummary();
    });
  }

  if (customButton) {
    customButton.addEventListener('click', () => {
      const message = 'Hola, quiero pedir una remera personalizada y me gustaría recibir más información.';
      window.open(createWhatsAppLink(message), '_blank', 'noopener');
    });
  }
}