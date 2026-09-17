# =====================================================================
# Build en dos etapas: compila Angular y sirve con Nginx.
# =====================================================================
FROM node:22-alpine AS build
WORKDIR /app

COPY transcripcion-gestion-frontend/package*.json ./
RUN npm ci

COPY transcripcion-gestion-frontend/. .
RUN npm run build

# ---------------------------------------------------------------------
FROM nginx:1.27-alpine

COPY transcripcion-gestion-frontend/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/transcripcion-gestion-frontend/browser /usr/share/nginx/html

EXPOSE 80
