# =====================================================================
# Imagen de base de datos PostgreSQL con el esquema de transcripcion.
# Los scripts en /docker-entrypoint-initdb.d se ejecutan en orden
# alfabetico la primera vez que se crea el volumen de datos.
# =====================================================================
FROM postgres:16-alpine

ENV POSTGRES_INITDB_ARGS="--encoding=UTF8 --locale=C"

COPY transcripcion_database/init/ /docker-entrypoint-initdb.d/

EXPOSE 5432
