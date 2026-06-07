# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Injecter l'URL de l'API au build (ex: https://redpandev.fr)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copier les fichiers package.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copier les deux configs nginx
COPY nginx.conf /etc/nginx/ssl.conf
COPY nginx-http.conf /etc/nginx/http.conf

# Config active par défaut (sera écrasée par l'entrypoint)
COPY nginx-http.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Copier le script de démarrage
COPY docker-entrypoint.sh /docker-entrypoint-custom.sh
RUN sed -i 's/\r$//' /docker-entrypoint-custom.sh && chmod +x /docker-entrypoint-custom.sh

EXPOSE 80 443

CMD ["/docker-entrypoint-custom.sh"]
