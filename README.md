# Retro Remeras

Sitio e-commerce estático para catálogo de remeras personalizadas. Funciona con HTML, CSS y JavaScript vanilla, usando `data/products.json` como fuente principal del catálogo.

## Estructura principal

- `index.html`: landing page, categorías, carrusel y promo bar.
- `catalogo.html`: catálogo con filtros y búsqueda.
- `producto.html`: detalle de producto, selección de talle/color/calce y carrito lateral.
- `carrito.html`: resumen del pedido y envío por WhatsApp.
- `css/`: estilos generales y específicos por página.
- `js/`: carga de datos, carrito, catálogo, producto, carrusel, navbar mobile y promo bar.
- `data/products.json`: productos del catálogo.
- `assets/catalogo/`: imágenes usadas por productos.
- `assets/img/`: imágenes generales de la landing.

## Cómo agregar productos

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

Podés subir la carpeta completa a Vercel, Netlify o cualquier hosting estático. El sitio no requiere base de datos ni backend para funcionar.

## Actualizar catálogo

Cada vez que cambies `products.json`, usá recarga dura del navegador si no ves cambios: `Ctrl + F5`. El loader usa `cache: no-store` para evitar que el navegador mantenga productos viejos.
