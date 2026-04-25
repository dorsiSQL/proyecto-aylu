# Firebase/Admin — Etapa 3: Adaptación del sitio main

## Objetivo

Adaptar el sitio público para que pueda leer productos desde Firebase Firestore sin romper el funcionamiento actual basado en `data/products.json`.

## Archivos modificados

- `js/data-loader.js`
- `README.md`

## Archivos agregados

- `js/firebase-config.js`
- `docs/FIREBASE_ADMIN_ETAPA_3_SITIO_MAIN.md`

## Qué cambió

### 1. Configuración pública de Firebase

Se agregó `js/firebase-config.js` con una configuración placeholder.

Mientras los valores sigan como `REEMPLAZAR_*`, Firebase queda desactivado automáticamente y el sitio sigue cargando productos desde `data/products.json`.

### 2. Carga de productos desde Firebase

`loadProducts()` ahora intenta este orden:

1. Firestore, colección `products`, solo productos con `activo == true`.
2. Si Firebase no está configurado, falla o no devuelve productos activos, usa `data/products.json`.
3. Si también falla `products.json`, usa fallback vacío y muestra aviso visual.

### 3. Compatibilidad con el sitio actual

Se mantienen los campos que ya usa el sitio:

- `id`
- `nombre`
- `categoria`
- `precio`
- `imagen`
- `imagenesPorColor`
- `descripcion`
- `disponible`
- `destacado`

También se agrega compatibilidad con `activo`, que será el campo principal para publicar/despublicar productos desde el admin.

### 4. Sitio público sin permisos de escritura

El sitio público solo importa módulos de lectura de Firestore. No usa Auth, no usa Storage write APIs y no contiene lógica de creación, edición o borrado.

La seguridad real debe quedar reforzada con las reglas de Firestore y Storage definidas en la etapa 2.

## Qué falta configurar manualmente

En `js/firebase-config.js` hay que reemplazar:

```js
apiKey: 'REEMPLAZAR_API_KEY',
authDomain: 'REEMPLAZAR_PROJECT_ID.firebaseapp.com',
projectId: 'REEMPLAZAR_PROJECT_ID',
storageBucket: 'REEMPLAZAR_PROJECT_ID.appspot.com',
messagingSenderId: 'REEMPLAZAR_MESSAGING_SENDER_ID',
appId: 'REEMPLAZAR_APP_ID'
```

con la configuración Web App de Firebase Console.

## Resultado esperado

- Si Firebase está configurado y tiene productos activos: el sitio usa Firestore.
- Si Firebase no está configurado: el sitio sigue usando `products.json`.
- Si Firebase falla temporalmente: el sitio sigue funcionando con `products.json`.
- El carrito, catálogo, producto, carrusel, estilos y responsive se mantienen intactos.
