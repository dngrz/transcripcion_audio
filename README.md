# Transcripcion de Audios (mp3 / wav) con OpenAI

Aplicacion full-stack para subir archivos de audio (`.mp3` y `.wav`), obtener su
transcripcion automatica en **espanol** usando el modelo `gpt-transcribe` de
OpenAI, revisar y corregir el texto, y conservar un historial de cambios.

> El archivo de audio **nunca se almacena**: se procesa en memoria y se descarta.
> En la base de datos solo se guardan metadata y el texto transcrito.

## Arquitectura

| Componente | Tecnologia | Carpeta |
|---|---|---|
| Backend | Java 17, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, Retrofit | `transcripcion-gestion-backend/` |
| Frontend | Angular 20 (standalone + signals), PrimeNG 20, Tailwind CSS 4 | `transcripcion-gestion-frontend/` |
| Base de datos | PostgreSQL 16 (script SQL + Dockerfile) | `transcripcion_database/` |
| Orquestacion | Podman/Docker Compose | `docker-compose.yml` |

```
transcripcion/
├── transcripcion-gestion-backend/     # API REST Spring Boot
├── transcripcion-gestion-frontend/    # SPA Angular
├── transcripcion_database/            # Esquema + seed + Dockerfile PostgreSQL
├── docker-compose.yml                 # Orquestacion de los 3 servicios
├── .env.example                       # Variables de entorno de ejemplo
└── README.md
```

## Funcionalidades

- Landing publico con informacion del servicio.
- Registro publico de usuarios y login con **JWT**.
- Roles **ADMIN** y **USER**.
- Subida de audio `.mp3` / `.wav` (maximo 25 MB) con transcripcion automatica.
- Revision y correccion manual del texto transcrito.
- **Historial de versiones**: cada correccion guarda texto anterior, texto nuevo,
  usuario que edito y fecha.
- Historico paginado de transcripciones con filtro "solo mis transcripciones".

## Requisitos

- [Podman](https://podman.io/) + `podman-compose` (o Docker + Docker Compose).
- Para desarrollo local sin contenedores:
  - Java 17 y Maven 3.9+
  - Node.js 20+ y npm
- Una **API key de OpenAI** con acceso a `gpt-transcribe`.

## Configuracion

1. Copia el archivo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y define al menos:

   - `OPENAI_API_KEY`: tu API key de OpenAI.
   - `JWT_SECRET`: una cadena larga y aleatoria (>= 32 caracteres).
   - `POSTGRES_PASSWORD`: contrasena de la base de datos.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: credenciales del administrador inicial.

## Ejecucion con Podman Compose

```bash
podman-compose up --build
```

Servicios publicados:

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend (API) | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| PostgreSQL | localhost:5432 |

Credenciales del administrador por defecto (configurables en `.env`):

```
Email:    admin@transcripcion.local
Password: Admin123*
```

Para detener y eliminar los contenedores (conservando los datos):

```bash
podman-compose down
```

Para eliminar tambien el volumen de datos:

```bash
podman-compose down -v
```

## Ejecucion en desarrollo (sin contenedores)

### 1. Base de datos

```bash
podman run --name transcripcion-db -e POSTGRES_DB=transcripcion_gestion \
  -e POSTGRES_USER=database_username -e POSTGRES_PASSWORD=database_password \
  -p 5432:5432 -v "$PWD/transcripcion_database/init:/docker-entrypoint-initdb.d:ro" \
  postgres:16-alpine
```

### 2. Backend

```bash
cd transcripcion-gestion-backend
export OPENAI_API_KEY=sk-...
export JWT_SECRET=un-secreto-largo-de-al-menos-32-caracteres
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 3. Frontend

```bash
cd transcripcion-gestion-frontend
npm install
npm start
```

El frontend (`http://localhost:4200`) redirige las llamadas `/api` al backend en
`http://localhost:8080` mediante `proxy.conf.json`.

## Endpoints principales

| Metodo | Ruta | Descripcion | Acceso |
|---|---|---|---|
| POST | `/api/auth/register` | Registrar usuario | Publico |
| POST | `/api/auth/login` | Iniciar sesion (devuelve JWT) | Publico |
| POST | `/api/transcriptions` | Subir audio y transcribir (multipart `file`) | Autenticado |
| GET | `/api/transcriptions` | Listar transcripciones (paginado; `?mine=true`) | Autenticado |
| GET | `/api/transcriptions/{id}` | Detalle de una transcripcion | Autenticado |
| PUT | `/api/transcriptions/{id}` | Corregir el texto (`{ "correctedText": "..." }`) | Autenticado |
| GET | `/api/transcriptions/{id}/revisions` | Historial de correcciones | Autenticado |

## Modelo de datos

- **users**: `id`, `email` (unico), `password_hash`, `full_name`, `role`
  (`ADMIN`/`USER`), `enabled`, `created_at`.
- **transcriptions**: `id`, `user_id`, `original_filename`, `format`,
  `size_bytes`, `language`, `transcribed_text`, `status`
  (`PENDIENTE_REVISION`/`REVISADA`), `created_at`, `updated_at`.
- **transcription_revisions**: `id`, `transcription_id`, `previous_text`,
  `new_text`, `edited_by_user_id`, `edited_at`.

Los scripts `transcripcion_database/init/01-schema.sql` y `02-seed.sql` se
ejecutan automaticamente la primera vez que se crea el volumen de PostgreSQL.

## Notas sobre OpenAI

- Modelo usado: `gpt-transcribe` (configurable con `OPENAI_MODEL`).
- Idioma de transcripcion: `es` (configurable con `OPENAI_LANGUAGE`).
- Formatos soportados por la API: `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`,
  `webm`. La aplicacion acepta unicamente **mp3** y **wav**.
- Tamano maximo por archivo: **25 MB**. La aplicacion rechaza archivos mayores
  antes de enviarlos.
- El audio se envia como `multipart/form-data` directamente desde memoria
  (Retrofit + OkHttp), sin crear archivos temporales.

## Pruebas

```bash
# Backend (unitarias)
cd transcripcion-gestion-backend
mvn test

# Frontend (build de produccion)
cd transcripcion-gestion-frontend
npm run build
```
