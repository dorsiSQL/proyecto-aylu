const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname, '..');

app.use(express.static(ROOT));

app.get('/api/products', async (_req, res) => {
  const file = path.join(ROOT, 'data', 'products.json');
  const data = await fs.readFile(file, 'utf-8');
  res.json(JSON.parse(data));
});

app.get('/api/designs', async (_req, res) => {
  const file = path.join(ROOT, 'data', 'designs.json');
  const data = await fs.readFile(file, 'utf-8');
  res.json(JSON.parse(data));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Retro Remeras listo en http://localhost:${PORT}`);
});