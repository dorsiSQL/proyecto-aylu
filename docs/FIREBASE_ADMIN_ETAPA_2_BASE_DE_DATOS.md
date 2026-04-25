# Retro Remeras — ETAPA 2: Diseño de base de datos Firebase

Esta etapa define la estructura de Firebase para conectar el sitio público y el futuro panel admin separado, sin modificar todavía la carga real del sitio.

## Objetivo de la etapa

- Definir colecciones de Firestore.
- Definir estructura de Firebase Storage.
- Definir campos estándar del producto.
- Preparar reglas de seguridad para Firestore y Storage.
- Mantener compatibilidad con el sitio actual, que hoy usa `data/products.json`.

---

## 1. Firestore

Colección principal:

```txt
products/{productId}
```

Cada producto vive como un documento individual dentro de `products`.

### ID del documento

Recomendación:

```txt
slug-del-producto
```

Ejemplos:

```txt
remera-atari
remera-goku
remera-bon-jovi
```

Esto facilita que el sitio use URLs legibles y evita depender de IDs numéricos.

Para no romper compatibilidad con el código actual, cada producto también puede conservar un campo interno `id`.

---

## 2. Campos del producto

Estructura recomendada:

```js
{
  id: "remera-atari",
  nombre: "Remera Atari",
  slug: "remera-atari",
  categoria: "Videojuegos",
  precio: 21000,
  descripcion: "Diseño Atari vintage",

  imagen: "https://firebasestorage.googleapis.com/.../atari-negra.png",
  imagenesPorColor: {
    Negro: "https://firebasestorage.googleapis.com/.../atari-negra.png",
    Blanco: "https://firebasestorage.googleapis.com/.../atari-blanca.jpg"
  },
  galeria: [
    "https://firebasestorage.googleapis.com/.../atari-negra.png"
  ],

  colores: ["Negro", "Blanco"],
  tiposRemera: ["Regular", "Oversize"],
  tallesPorTipo: {
    Regular: ["XS", "S", "M", "L", "XL", "XXL"],
    Oversize: ["M", "L", "XL", "XXL"]
  },

  disponible: true,
  activo: true,
  destacado: true,

  stock: null,
  stockPorVariante: {
    Negro: {
      Regular: {
        XS: null,
        S: null,
        M: null,
        L: null,
        XL: null,
        XXL: null
      },
      Oversize: {
        M: null,
        L: null,
        XL: null,
        XXL: null
      }
    },
    Blanco: {
      Regular: {
        XS: null,
        S: null,
        M: null,
        L: null,
        XL: null,
        XXL: null
      },
      Oversize: {
        M: null,
        L: null,
        XL: null,
        XXL: null
      }
    }
  },

  orden: 10,
  tags: ["retro", "gaming", "atari"],

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 3. Compatibilidad con el sitio actual

El sitio actual espera estos campos:

```js
id
nombre
categoria
precio
imagen
imagenesPorColor
descripcion
disponible
destacado
```

Por eso, en Firestore deben mantenerse como mínimo esos campos.

Campos nuevos como `activo`, `slug`, `galeria`, `tallesPorTipo`, `stockPorVariante` y `orden` se agregan para soportar el futuro panel admin sin romper el sitio existente.

### Regla de visibilidad pública

Para el sitio público, un producto debería mostrarse solo si:

```js
activo === true && disponible === true
```

`activo` representa si está publicado desde el admin.

`disponible` representa si se puede comprar o encargar.

---

## 4. Firebase Storage

Estructura recomendada:

```txt
products/{productId}/main/{filename}
products/{productId}/colors/{color}/{filename}
products/{productId}/gallery/{filename}
products/{productId}/size-guides/{filename}
```

Ejemplo real:

```txt
products/remera-atari/main/atari-negra.png
products/remera-atari/colors/negro/atari-negra.png
products/remera-atari/colors/blanco/atari-blanca.jpg
products/remera-atari/gallery/atari-01.png
products/remera-atari/size-guides/regular.png
products/remera-atari/size-guides/oversize.png
```

Para las tablas de talle actuales, el sitio todavía puede seguir usando:

```txt
assets/talles-producto/
```

Más adelante, si conviene, se puede migrar también a Storage.

---

## 5. Reglas de seguridad — Firestore

Archivo agregado:

```txt
firebase/firestore.rules
```

Criterio:

- Público: puede leer únicamente productos activos y disponibles.
- Admin autenticado/autorizado: puede leer, crear, editar y borrar productos.
- La autorización admin se hace por custom claim `admin: true`.

Regla principal:

```js
allow read: if isAdmin() || resource.data.activo == true && resource.data.disponible == true;
allow create, update, delete: if isAdmin();
```

---

## 6. Reglas de seguridad — Storage

Archivo agregado:

```txt
firebase/storage.rules
```

Criterio:

- Público: puede leer imágenes dentro de `products`.
- Admin autenticado/autorizado: puede subir, editar y borrar imágenes.
- Se limita el tamaño máximo a 8 MB.
- Solo se permiten archivos `image/*`.

---

## 7. Custom claim admin

Para que las reglas funcionen correctamente, la cuenta de la dueña/admin debe tener un custom claim:

```js
admin: true
```

Eso no se configura desde el frontend público ni desde el panel admin inicial.

Se debe configurar una vez desde un entorno seguro usando Firebase Admin SDK, Cloud Functions o una herramienta local privada.

Ejemplo conceptual:

```js
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

Nunca debe subirse una private key al frontend ni a Vercel como archivo público.

---

## 8. Ejemplo de documento inicial

Archivo agregado:

```txt
firebase/examples/product.firestore.example.json
```

Sirve como referencia para cargar o migrar productos desde `data/products.json`.

---

## 9. Decisión técnica para próximas etapas

En ETAPA 3 conviene modificar principalmente:

```txt
js/data-loader.js
```

Objetivo:

1. Intentar leer productos desde Firestore.
2. Filtrar productos activos/disponibles.
3. Si Firebase falla, usar `data/products.json` como fallback.
4. Mantener el formato que ya consumen `catalogo.js`, `producto.js` y `carousel.js`.

Esto minimiza el riesgo de romper el sitio.
