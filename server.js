/* ============================================================
   TaskBoard Server
   Servidor mínimo (Node.js + Express + SQLite) que expone el
   estado completo del tablero como un único blob JSON en una
   tabla de una fila, igual que el modelo que ya usaba el
   almacenamiento compartido de artifacts — así el frontend casi
   no necesita cambios de lógica, solo de a dónde llama.

   Usa node:sqlite (integrado en Node.js desde la versión 22.5,
   estable desde la 25.7) en vez del paquete better-sqlite3. La
   razón: better-sqlite3 necesita compilar código C++ nativo en
   el momento de instalar (node-gyp), y esa compilación puede
   fallar si el hosting usa una versión de Node muy nueva para la
   que aún no existe un binario precompilado — es justamente lo
   que pasó al desplegar esto en Render con Node 26.5 recién
   salido. node:sqlite viene incluido en el propio Node, sin nada
   que compilar, así que este problema desaparece de raíz.

   Rutas:
     GET  /api/data           -> devuelve { data, updatedAt }
     PUT  /api/data           -> guarda el body como nuevo estado
     GET  /api/health         -> chequeo simple de que el server vive

   La sincronización entre personas es por "polling": el frontend
   pregunta cada pocos segundos si hay datos más nuevos. No es
   instantánea al segundo exacto, pero es simple, gratis de alojar,
   y no depende de mantener conexiones abiertas (WebSockets), que
   algunos planes de hosting gratuitos cortan tras un rato de
   inactividad.
   ============================================================ */

const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'taskboard.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');

// Una sola fila (id fijo = 1) guarda todo el estado del tablero como texto
// JSON. Es el mismo patrón "un blob" que ya usaba window.storage — cambia
// dónde vive el dato, no la forma de los datos.
db.exec(`
  CREATE TABLE IF NOT EXISTS board_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/data', (req, res) => {
  try {
    const row = db.prepare('SELECT data, updated_at AS updatedAt FROM board_state WHERE id = 1').get();
    if (!row) {
      return res.json({ data: null, updatedAt: null });
    }
    res.json({ data: JSON.parse(row.data), updatedAt: row.updatedAt });
  } catch (e) {
    console.error('Error al leer datos:', e);
    res.status(500).json({ error: 'No se pudo leer el estado del tablero.' });
  }
});

app.put('/api/data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Cuerpo de la petición inválido.' });
    }
    const json = JSON.stringify(payload);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO board_state (id, data, updated_at) VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `).run(json, now);
    res.json({ ok: true, updatedAt: now });
  } catch (e) {
    console.error('Error al guardar datos:', e);
    res.status(500).json({ error: 'No se pudo guardar el estado del tablero.' });
  }
});

// Cualquier otra ruta que no sea /api/* sirve el frontend (SPA simple)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('TaskBoard Server escuchando en el puerto ' + PORT);
});
