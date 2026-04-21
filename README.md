# Retro Remeras

Sitio web completo para un e-commerce de remeras personalizadas, hecho con HTML, CSS y JavaScript vanilla.

## Qué incluye
- Landing page (`index.html`)
- Catálogo dinámico (`catalogo.html`)
- Página de personalización (`personalizar.html`)
- Datos desacoplados en `data/products.json` y `data/designs.json`
- Render dinámico, filtros y búsqueda con JS
- Botón de WhatsApp generado automáticamente
- Favicon y assets de ejemplo
- Opción secundaria de backend simple con Node + Express

## Estructura
```txt
/retro-remeras
  index.html
  catalogo.html
  personalizar.html
  /css
    style.css
    catalogo.css
    personalizar.css
  /js
    script.js
    data-loader.js
    catalogo.js
    personalizar.js
  /data
    products.json
    designs.json
  /assets
    /img
    /icons
    /logo
  /server
    package.json
    server.js
```

## Cómo abrirlo
### Opción 1 — abrir directo
Podés abrir `index.html` directamente en el navegador.

> Nota: algunos navegadores bloquean `fetch()` cuando abrís archivos con `file://`.  
> Por eso `js/data-loader.js` tiene un respaldo local para que el sitio siga funcionando igual.

### Opción 2 — recomendado para trabajar con JSON real
Levantá un servidor local simple.

#### Con VS Code + Live Server
1. Abrí la carpeta del proyecto.
2. Instalá la extensión **Live Server**.
3. Click derecho sobre `index.html`.
4. Elegí **Open with Live Server**.

#### Con Node
```bash
cd server
npm install
npm start
```

Después abrí:
```txt
http://localhost:3000
```

## Qué editar
### Productos
Editá:
- `data/products.json`

Campos disponibles:
- `id`
- `nombre`
- `categoria`
- `precio`
- `imagen`
- `descripcion`
- `disponible`
- `destacado`

### Diseños personalizables
Editá:
- `data/designs.json`

### Textos y estructura
- Home: `index.html`
- Catálogo: `catalogo.html`
- Personalización: `personalizar.html`

### Colores / look visual
- Base global: `css/style.css`
- Ajustes del catálogo: `css/catalogo.css`
- Ajustes de personalización: `css/personalizar.css`

## Lógica JS
- `js/script.js`: menú mobile, navegación y helpers generales
- `js/catalogo.js`: render dinámico, filtros, búsqueda y modal
- `js/personalizar.js`: selección de diseño, color, talle y link de WhatsApp
- `js/data-loader.js`: carga JSON + fallback local

## WhatsApp
Número configurado:
- `+54 9 11 5659-2963`

Mensaje principal generado:
```txt
Hola, quiero este diseño: [DISEÑO], color: [COLOR], talle: [TALLE].
```

Mensaje alternativo:
```txt
Hola, quiero pedir una remera personalizada y me gustaría recibir más información.
```

## Backend opcional
La carpeta `server` deja una implementación mínima con Express:
- Sirve los archivos estáticos
- Expone `/api/products`
- Expone `/api/designs`

No es necesario para usar el sitio, pero sirve si después querés escalarlo o integrar panel/admin.