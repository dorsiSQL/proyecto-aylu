// Carga datos desde JSON. Si el navegador bloquea fetch en file://,
// usa un respaldo local para que el sitio siga funcionando al abrirlo directamente.

const fallbackProducts = [
  {"id":1,"nombre":"Remera Maradona 86","categoria":"Fútbol","precio":18990,"imagen":"assets/img/futbol-maradona.svg","descripcion":"Diseño inspirado en la mística del '86, con impronta retro y gráfica gastada.","disponible":true,"destacado":true},
  {"id":2,"nombre":"Remera Campeones del Mundo","categoria":"Fútbol","precio":19490,"imagen":"assets/img/futbol-campeones.svg","descripcion":"Edición homenaje con estética vintage y detalles en dorado.","disponible":true,"destacado":true},
  {"id":3,"nombre":"Remera Neo Tokyo","categoria":"Anime","precio":19990,"imagen":"assets/img/anime-neotokyo.svg","descripcion":"Gráfica urbana con guiños al anime clásico y paleta intensa.","disponible":true,"destacado":true},
  {"id":4,"nombre":"Remera Espíritu Shonen","categoria":"Anime","precio":18490,"imagen":"assets/img/anime-shonen.svg","descripcion":"Tipografía poderosa y composición inspirada en openings noventeros.","disponible":true,"destacado":false},
  {"id":5,"nombre":"Remera Cult Classic","categoria":"Cine / Películas","precio":20990,"imagen":"assets/img/cine-cult.svg","descripcion":"Estética de afiche antiguo para amantes del cine de culto.","disponible":true,"destacado":true},
  {"id":6,"nombre":"Remera VHS Nights","categoria":"Cine / Películas","precio":17990,"imagen":"assets/img/cine-vhs.svg","descripcion":"Diseño nostálgico que mezcla terror, videoclub y textura retro.","disponible":true,"destacado":false},
  {"id":7,"nombre":"Remera 8-Bit Legends","categoria":"Videojuegos","precio":18990,"imagen":"assets/img/gaming-8bit.svg","descripcion":"Pixel art con aire arcade para fans del gaming clásico.","disponible":true,"destacado":true},
  {"id":8,"nombre":"Remera Boss Fight","categoria":"Videojuegos","precio":19990,"imagen":"assets/img/gaming-boss.svg","descripcion":"Composición potente con tipografía de póster y energía gamer.","disponible":true,"destacado":false},
  {"id":9,"nombre":"Remera Garage Sessions","categoria":"Variados","precio":17490,"imagen":"assets/img/variados-garage.svg","descripcion":"Inspiración rock, cultura callejera y gráfica de recital.","disponible":true,"destacado":false},
  {"id":10,"nombre":"Remera Summer Soda","categoria":"Variados","precio":16990,"imagen":"assets/img/variados-soda.svg","descripcion":"Diseño descontracturado con vibra pop y colores cálidos.","disponible":true,"destacado":false},
  {"id":11,"nombre":"Remera Motel Sunset","categoria":"Vintage","precio":20490,"imagen":"assets/img/vintage-motel.svg","descripcion":"Una postal retro convertida en remera, con look gastado.","disponible":true,"destacado":true},
  {"id":12,"nombre":"Remera Retro Diner Club","categoria":"Vintage","precio":19690,"imagen":"assets/img/vintage-diner.svg","descripcion":"Inspirada en cartelería americana, tipografía bold y tonos crema.","disponible":true,"destacado":true}
];

const fallbackDesigns = [
  {"id":"diseno-01","nombre":"Tipografía Retro Remeras","thumb":"assets/img/design-retro.svg","descripcion":"Logo vintage de la marca con look desgastado."},
  {"id":"diseno-02","nombre":"Rayos & Cassette","thumb":"assets/img/design-cassette.svg","descripcion":"Composición con cassette, rayos y textura rockera."},
  {"id":"diseno-03","nombre":"Arcade Nights","thumb":"assets/img/design-arcade.svg","descripcion":"Diseño gamer con inspiración 8-bit."},
  {"id":"diseno-04","nombre":"Custom Full","thumb":"assets/img/design-custom.svg","descripcion":"Para quienes quieren pedir una idea totalmente a medida."}
];

async function loadJson(path, fallbackData) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('No se pudo cargar ' + path);
    return await response.json();
  } catch (error) {
    console.warn(`[Retro Remeras] Usando respaldo local para ${path}.`, error);
    return structuredClone(fallbackData);
  }
}

export async function loadProducts() {
  return loadJson('./data/products.json', fallbackProducts);
}

export async function loadDesigns() {
  return loadJson('./data/designs.json', fallbackDesigns);
}

export function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
}

export function normalizeText(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function createWhatsAppLink(message) {
  const base = 'https://wa.me/5491156592963';
  return `${base}?text=${encodeURIComponent(message)}`;
}