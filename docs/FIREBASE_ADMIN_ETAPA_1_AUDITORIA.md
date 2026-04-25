# Retro Remeras — Etapa 1: Auditoría técnica para Firebase + Admin

Este documento corresponde únicamente a la **ETAPA 1 — Auditoría**. No modifica la lógica del sitio público ni cambia rutas, estilos, carrito, catálogo, producto, responsive ni funcionalidades existentes.

## 1. Estado actual del proyecto

El proyecto actual es un e-commerce estático compuesto por archivos HTML, CSS, JavaScript, JSON e imágenes locales.

La fuente actual de productos es:

```txt
data/products.json
```

El sitio no tiene backend obligatorio para mostrar productos. El carrito funciona del lado cliente usando `localStorage`.

## 2. Cómo carga productos hoy

La carga de productos está centralizada en:

```txt
js/data-loader.js
```

Función actual:

```js
export async function loadProducts() {
  return loadJson('data/products.json', fallbackProducts, 'products');
}
```

Flujo actual:

```txt
data/products.json
        ↓
js/data-loader.js / loadProducts()
        ↓
js/catalogo.js
js/producto.js
js/carousel.js
```

Esto es positivo porque permite migrar a Firebase tocando principalmente `js/data-loader.js`, manteniendo el resto del sitio lo más estable posible.

## 3. Archivos críticos detectados

### HTML principales

```txt
index.html
catalogo.html
producto.html
carrito.html
```

### CSS principales

```txt
css/style.css
css/catalogo.css
css/producto.css
css/carrito.css
```

### JavaScript principales

```txt
js/data-loader.js
js/catalogo.js
js/producto.js
js/carousel.js
js/cart.js
js/carrito.js
js/script.js
js/promo-bar.js
```

### Datos actuales

```txt
data/products.json
data/designs.json
```

### Assets importantes

```txt
assets/catalogo/
assets/talles-producto/
assets/category-cards/
assets/logo/
assets/icons/
assets/img/
```

## 4. Responsabilidad de cada archivo JS crítico

### `js/data-loader.js`

Archivo más importante para la migración. Actualmente:

- carga `products.json`;
- carga `designs.json`;
- formatea precios;
- normaliza textos;
- genera links de producto;
- genera links de WhatsApp;
- valida URLs seguras;
- renderiza aviso cuando falla la carga de datos.

Debe ser el punto principal de adaptación a Firebase.

### `js/catalogo.js`

Usa `loadProducts()` para renderizar catálogo, categorías, búsqueda y filtros.

Debe seguir recibiendo un array de productos con estructura compatible.

### `js/producto.js`

Usa `loadProducts()` para encontrar el producto por `id` desde la URL.

También maneja:

- color de remera;
- imagen por color;
- talle;
- tipo de remera regular/oversize;
- tabla de talles;
- agregado al carrito.

Debe conservar compatibilidad con campos como `imagenesPorColor`, `imagen`, `precio`, `nombre`, `descripcion`, `categoria`, `disponible` y `destacado`.

### `js/carousel.js`

Usa `loadProducts()` y filtra productos con:

```js
product.disponible
product.destacado
```

Para Firebase conviene mantener esos nombres o mapearlos desde `activo`.

### `js/cart.js`

Maneja carrito local. No debería tocarse en las primeras etapas porque no depende de Firebase.

## 5. Modelo actual de producto

Ejemplo actual en `data/products.json`:

```json
{
  "id": 1,
  "nombre": "Remera Atari",
  "categoria": "Videojuegos",
  "precio": 21000,
  "imagen": "assets/catalogo/diseno-atari/atari-negra.png",
  "imagenesPorColor": {
    "Negro": "assets/catalogo/diseno-atari/atari-negra.png",
    "Blanco": "assets/catalogo/diseno-atari/atari-blanca.jpg"
  },
  "descripcion": "Diseño atari vintage",
  "disponible": true,
  "destacado": true
}
```

Campos mínimos que el sitio público espera hoy:

```txt
id
nombre
categoria
precio
imagen
descripcion
disponible
destacado
imagenesPorColor opcional
```

## 6. Riesgos detectados para la migración

### Riesgo 1: romper compatibilidad de campos

Si Firebase usa solo `activo` y el sitio sigue filtrando por `disponible`, podrían desaparecer productos del catálogo.

Recomendación:

- mantener `disponible` por compatibilidad;
- agregar `activo` como campo nuevo;
- en el loader mapear `disponible = activo !== false && disponible !== false`.

### Riesgo 2: IDs numéricos vs IDs string

Hoy los productos usan `id` numérico.

Firestore usa IDs de documento string.

Recomendación:

- guardar `id` como string estable en Firestore;
- permitir que el sitio compare ambos como string;
- evitar depender de IDs autogenerados visibles para URLs si se quiere SEO más prolijo luego.

### Riesgo 3: imágenes locales vs Firebase Storage

Hoy las imágenes viven en `assets/`.

Firebase Storage devolverá URLs remotas.

Recomendación:

- mantener `imagen` como URL principal;
- mantener `imagenesPorColor` como objeto de URLs;
- permitir que `safeUrl()` acepte URLs `https://`, algo que actualmente ya permite.

### Riesgo 4: fallback vacío

Actualmente `fallbackProducts` es un array vacío dentro de `js/data-loader.js`.

Si falla `products.json`, no hay productos de respaldo reales.

Recomendación para Etapa 3:

- conservar fallback a `data/products.json` si Firebase falla;
- no depender de un array hardcodeado vacío.

## 7. Propuesta inicial de arquitectura Firebase

### Firestore

Colección principal propuesta:

```txt
products/{productId}
```

Campos recomendados para compatibilidad:

```txt
id
slug
nombre
categoria
precio
descripcion
imagen
imagenesPorColor
galeria
talles
tiposRemera
colores
destacado
disponible
activo
stock
createdAt
updatedAt
createdBy
updatedBy
```

### Firebase Storage

Estructura propuesta:

```txt
products/{productId}/main/
products/{productId}/colors/
products/{productId}/gallery/
```

Ejemplo:

```txt
products/atari/main/atari-negra.png
products/atari/colors/negro.png
products/atari/colors/blanco.jpg
products/atari/gallery/frente.png
```

## 8. Archivos que probablemente se modificarán en Etapa 3

Modificación principal:

```txt
js/data-loader.js
```

Modificaciones posibles, solo si son necesarias:

```txt
js/catalogo.js
js/producto.js
js/carousel.js
```

Archivos que deberían evitarse salvo necesidad real:

```txt
js/cart.js
js/carrito.js
css/style.css
css/catalogo.css
css/producto.css
css/carrito.css
```

## 9. Estrategia técnica recomendada para Etapa 3

La migración segura debería hacerse así:

```txt
Intentar cargar productos activos desde Firestore
        ↓ si funciona
Normalizar campos para que coincidan con el sitio actual
        ↓ si falla
Cargar data/products.json como fallback
        ↓ si falla
Mostrar aviso existente de carga de datos
```

Esto evita romper el sitio público durante deploys, errores de configuración o problemas temporales de Firebase.

## 10. Conclusión de auditoría

El proyecto está bien encaminado para conectar Firebase porque la carga de productos ya está centralizada.

La recomendación es no reescribir el catálogo ni el producto desde cero. Lo mejor es crear una capa de datos Firebase-compatible dentro de `js/data-loader.js` y mantener el resto del sitio consumiendo el mismo formato de productos.

La Etapa 1 queda cerrada con esta documentación. La próxima etapa debería definir con precisión:

- estructura Firestore;
- estructura Storage;
- reglas de seguridad;
- campos obligatorios/opcionales;
- ejemplo real de documento `product`.
