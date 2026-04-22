/**
 * config.js — Configuración central de Retro Remeras
 *
 * Editá este archivo para cambiar el número de WhatsApp,
 * mensajes, o cualquier dato global del sitio.
 * No toques los otros archivos JS para esto.
 */

export const CONFIG = {

  // ─── WhatsApp ──────────────────────────────────────────
  // Formato internacional sin espacios ni guiones ni el +
  whatsapp: {
    number: "5491156592963",

    // Mensaje cuando el usuario elige un producto del catálogo
    // Usá {design}, {color}, {size} como variables — se reemplazan automáticamente
    msgPedido: "Hola, quiero este diseño: {design}, color: {color}, talle: {size}.",

    // Mensaje para pedido personalizado (botón "Quiero una remera personalizada")
    msgPersonalizado: "Hola, quiero pedir una remera personalizada y me gustaría recibir más información.",
  },

  // ─── Sitio ─────────────────────────────────────────────
  siteName:   "Retro Remeras",
  siteUrl:    "https://proyecto-aylu.vercel.app",

  // ─── Redes sociales ────────────────────────────────────
  social: {
    instagram: "@retroremeras",
    tiktok:    "@retroremeras",
  },

};

/**
 * Genera la URL de WhatsApp para un pedido de producto.
 * @param {string} design  - Nombre del diseño
 * @param {string} color   - Color elegido
 * @param {string} size    - Talle elegido
 * @returns {string} URL lista para usar en href
 */
export function buildWhatsAppUrl(design, color, size) {
  const msg = CONFIG.whatsapp.msgPedido
    .replace("{design}", design)
    .replace("{color}",  color)
    .replace("{size}",   size);

  return `https://wa.me/${CONFIG.whatsapp.number}?text=${encodeURIComponent(msg)}`;
}

/**
 * Genera la URL de WhatsApp para un pedido personalizado.
 * @returns {string} URL lista para usar en href
 */
export function buildWhatsAppCustomUrl() {
  return `https://wa.me/${CONFIG.whatsapp.number}?text=${encodeURIComponent(CONFIG.whatsapp.msgPersonalizado)}`;
}
