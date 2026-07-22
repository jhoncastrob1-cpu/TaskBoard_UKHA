# TaskBoard Server

Servidor propio de TaskBoard: una página web con acceso libre por enlace, donde varias personas pueden ver y editar el mismo tablero al mismo tiempo. No requiere que nadie instale nada — solo abrir la URL en el navegador.

## Qué incluye

- `server.js` — servidor Node.js (Express) con base de datos SQLite incluida
- `public/index.html` — el TaskBoard completo (Kanban, Gantt, equipo, exportaciones, etc.)
- `package.json` — dependencias que Render instalará automáticamente

Los datos se guardan en un archivo (`data/taskboard.db`) que vive junto al servidor. Todas las personas que abran la URL ven y editan el mismo tablero, con una sincronización automática cada 4 segundos (si alguien más hizo un cambio, tu pantalla se actualiza sola sin que tengas que recargar).

---

## Paso 1 — Crear una cuenta en GitHub (si no tienes una)

Render despliega directamente desde un repositorio de GitHub. Ve a **github.com** y crea una cuenta gratuita si no tienes una.

## Paso 2 — Subir estos archivos a un repositorio de GitHub

1. En GitHub, haz clic en **New repository** (botón verde, arriba a la derecha).
2. Ponle un nombre, por ejemplo `taskboard-empresa`. Puede ser privado o público, cualquiera funciona.
3. Crea el repositorio (no hace falta marcar ninguna opción adicional).
4. En la página del repositorio recién creado, haz clic en **uploading an existing file** (o el botón "Add file → Upload files").
5. Arrastra **todos** los archivos y carpetas de este paquete (`server.js`, `package.json`, `.gitignore`, la carpeta `public/` completa, la carpeta `data/` con su `.gitkeep`) y confirma la subida ("Commit changes").

## Paso 3 — Crear una cuenta en Render

Ve a **render.com** y crea una cuenta gratuita (puedes registrarte directamente con tu cuenta de GitHub, es más rápido).

## Paso 4 — Crear el servicio web en Render

1. En el panel de Render, haz clic en **New +** → **Web Service**.
2. Conecta tu cuenta de GitHub si te lo pide, y selecciona el repositorio que acabas de crear (`taskboard-empresa`).
3. Render va a detectar automáticamente que es un proyecto Node.js. Verifica que los campos queden así:
   - **Name**: el que quieras (será parte de tu URL, ej. `taskboard-empresa` → `taskboard-empresa.onrender.com`)
   - **Region**: la más cercana a ti o a tu equipo
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
4. Haz clic en **Create Web Service**.

Render va a instalar las dependencias y arrancar el servidor. Esto toma unos 2-5 minutos la primera vez. Cuando termine, verás un enlace arriba tipo `https://taskboard-empresa.onrender.com` — **esa es la URL que le compartes a tus compañeros.**

## Paso 5 — Guardar los datos entre reinicios (disco persistente)

Importante: en el plan gratuito, si no añades esto, **los datos se borran cada vez que Render reinicia el servidor** (algo que ocurre automáticamente tras 15 minutos sin uso). Para evitarlo:

1. En la página de tu servicio en Render, ve a la pestaña **Disks**.
2. Haz clic en **Add Disk**.
3. Configúralo así:
   - **Name**: `taskboard-data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: 1 GB (de sobra, es más que suficiente y sigue siendo gratis)
4. Guarda. Render reiniciará el servicio una vez más para aplicar el disco.

Con esto, aunque el servidor se duerma y despierte, tus datos seguirán ahí.

## Paso 6 — Empezar a usarlo

Abre la URL que te dio Render. Verás el tablero de ejemplo la primera vez. Si ya tenías datos exportados de una versión anterior (el botón "Exportar" descarga un `.json`), puedes usar "Importar" para cargarlos aquí y que todo tu equipo los vea desde ese momento.

---

## Cosas que debes saber (letra chica del plan gratuito)

- **El servidor "se duerme"** tras 15 minutos sin que nadie lo visite. La primera persona que entre después de eso va a esperar unos 20-30 segundos mientras "despierta" — es normal, no está roto.
- **La sincronización no es instantánea al milisegundo**: cada persona revisa cada 4 segundos si hay cambios nuevos de otros. Para uso normal de equipo esto es imperceptible.
- **Si dos personas editan la misma tarjeta exactamente al mismo tiempo**, gana el último guardado — no hay una fusión inteligente de ambos cambios.
- **Cualquiera con la URL puede editar el tablero.** No hay pantalla de login. Si necesitas restringir el acceso, avísame y lo agregamos (usuario/contraseña simple es lo más rápido de añadir).

## Si algo falla

- Revisa la pestaña **Logs** en Render — ahí se ve cualquier error del servidor en tiempo real.
- El indicador en la esquina superior de TaskBoard ("Guardado" / "Guardando…" / "Sin guardar") te avisa si hay un problema de conexión con el servidor.
