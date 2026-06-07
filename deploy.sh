#!/bin/bash

# Script de déploiement pour Hostinger VPS
# Usage: ./deploy.sh

echo "🚀 Déploiement SitePro..."

# Arrêter les conteneurs existants
echo "📦 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down

# Pull des dernières modifications (si git)
echo "📥 Mise à jour du code..."
git pull origin main

# Rebuild et démarrage
echo "🔨 Construction des images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# Vérification
echo "✅ Vérification des conteneurs..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Déploiement terminé!"
echo "Frontend: https://redpandev.fr"
echo "Backend API: https://redpandev.fr/api"
