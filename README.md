# Retro Remeras

Sitio e-commerce estático para catálogo de remeras personalizadas. Funciona con HTML, CSS y JavaScript vanilla, usando Firebase Firestore como fuente remota cuando está configurado, con `data/products.json` como fallback seguro.

## Estructura principal

- `index.html`: landing page, categorías, carrusel y promo bar.
- `catalogo.html`: catálogo con filtros y búsqueda.
- `producto.html`: detalle de producto, selección de talle/color/calce y carrito lateral.
- `carrito.html`: resumen del pedido y envío por WhatsApp.
- `css/`: estilos generales y específicos por página.
- `js/`: carga de datos, carrito, catálogo, producto, carrusel, navbar mobile y promo bar.
- `data/products.json`: fallback local de productos del catálogo.
- `js/firebase-config.js`: configuración pública de Firebase Web SDK para leer productos desde Firestore.
- `assets/catalogo/`: imágenes usadas por productos.
- `assets/img/`: imágenes generales de la landing.

## Cómo agregar productos

Mientras el panel admin no esté implementado, se mantiene el flujo manual con `products.json` como fallback:

1. Subí la imagen del producto a `assets/catalogo/`.
2. Abrí `data/products.json`.
3. Copiá un bloque de producto existente.
4. Pegalo debajo del último producto.
5. Cambiá estos campos:
   - `id`: número único, siguiente al último.
   - `nombre`: nombre visible del producto.
   - `categoria`: una de estas categorías: `Fútbol`, `Anime`, `Cine / Películas`, `Videojuegos`, `Variados`, `Vintage`.
   - `precio`: número sin símbolos.
   - `imagen`: ruta, por ejemplo `assets/catalogo/remera-nueva.jpg`.
   - `descripcion`: texto breve.
   - `disponible`: `true` o `false`.
   - `destacado`: `true` para que pueda aparecer en el carrusel del inicio.
6. Guardá el archivo y recargá la web.

Ejemplo:

```json
{
  "id": 99,
  "nombre": "Remera Nueva",
  "categoria": "Vintage",
  "precio": 21000,
  "imagen": "assets/catalogo/remera-nueva.jpg",
  "descripcion": "Diseño retro personalizado",
  "disponible": true,
  "destacado": false
}
```

## Cómo probar localmente

Opción simple: abrir `index.html` con Live Server desde VS Code.

Opción terminal:

```bash
npx serve .
```

También existe un servidor Express opcional en `server/` para pruebas locales. No es necesario para deploy estático.

## Deploy estático

Podés subir la carpeta completa a Vercel, Netlify o cualquier hosting estático. El sitio puede funcionar como estático puro usando `products.json`, o conectado a Firebase Firestore cuando `js/firebase-config.js` tenga la configuración real.

## Actualizar catálogo

Cada vez que cambies `products.json`, usá recarga dura del navegador si no ves cambios: `Ctrl + F5`. El loader usa `cache: no-store` para evitar que el navegador mantenga productos viejos. Si Firebase está configurado, el sitio intentará leer primero desde Firestore y usará `products.json` solo como respaldo.

## Documentación Firebase/Admin

- `docs/FIREBASE_ADMIN_ETAPA_1_AUDITORIA.md`: auditoría técnica inicial para migrar productos a Firebase y crear un panel admin separado.
- `docs/FIREBASE_ADMIN_ETAPA_2_BASE_DE_DATOS.md`: diseño de Firestore, Storage, reglas y ejemplo de producto.
- `docs/FIREBASE_ADMIN_ETAPA_3_SITIO_MAIN.md`: adaptación del sitio público para leer productos desde Firebase con fallback seguro.
