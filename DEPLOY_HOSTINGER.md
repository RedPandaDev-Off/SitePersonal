# Guide de déploiement sur Hostinger VPS

## Prérequis
- VPS Hostinger avec Ubuntu 22.04 (minimum 2GB RAM)
- Nom de domaine pointant vers l'IP du VPS

## Étape 1 : Se connecter au VPS

```bash
ssh root@VOTRE_IP_VPS
```

## Étape 2 : Installer Docker

```bash
# Mise à jour du système
apt update && apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
apt install docker-compose-plugin -y

# Vérifier l'installation
docker --version
docker compose version
```

## Étape 3 : Cloner le projet

```bash
cd /var/www
git clone https://github.com/VOTRE_REPO/sitepro.git
cd sitepro
```

Ou transférer les fichiers via SFTP/SCP.

## Étape 4 : Configurer l'environnement

```bash
cd backend

# Créer le fichier .env de production
cat > .env << 'EOF'
# Base de données - CHANGEZ CES VALEURS !
DB_USER=sitepro_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE_ICI
DB_NAME=freelance_db
DB_HOST=postgres
DB_PORT=5432

# Stripe - Utilisez vos clés LIVE
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET

# URL de votre domaine
CLIENT_URL=https://votre-domaine.com

# Port
PORT=4000
EOF
```

## Étape 5 : Lancer l'application

```bash
# Premier lancement
docker compose up -d --build

# Vérifier que tout fonctionne
docker compose ps
docker compose logs -f
```

## Étape 6 : Configurer SSL avec Let's Encrypt

```bash
# Créer les dossiers pour Certbot
mkdir -p certbot/conf certbot/www

# Obtenir le certificat SSL (remplacez votre-domaine.com)
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  -d votre-domaine.com \
  --email votre@email.com \
  --agree-tos \
  --no-eff-email

# Après avoir obtenu le certificat, modifier nginx.conf :
# 1. Décommenter la redirection HTTP vers HTTPS
# 2. Décommenter le bloc server HTTPS
# 3. Remplacer "votre-domaine.com" par votre vrai domaine

# Rebuild le frontend
docker compose up -d --build frontend
```

## Étape 7 : Configurer Stripe Webhook

1. Allez sur https://dashboard.stripe.com/webhooks
2. Ajoutez un endpoint : `https://votre-domaine.com/api/payments/webhook`
3. Sélectionnez les événements : `checkout.session.completed`, `payment_intent.succeeded`
4. Copiez le Webhook Secret dans votre `.env`

## Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Logs d'un service
docker compose logs -f backend

# Redémarrer un service
docker compose restart backend

# Arrêter tout
docker compose down

# Mettre à jour après un git pull
docker compose up -d --build

# Accéder à la base de données
docker exec -it sitepro-postgres psql -U sitepro_user -d freelance_db

# Backup de la base de données
docker exec sitepro-postgres pg_dump -U sitepro_user freelance_db > backup.sql
```

## Firewall (UFW)

```bash
# Activer le firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

## Problèmes fréquents

### Le site ne charge pas
```bash
docker compose ps  # Vérifier que tous les conteneurs sont "Up"
docker compose logs frontend  # Voir les erreurs Nginx
```

### Erreur de connexion à la BDD
```bash
docker compose logs postgres
docker compose logs backend
```

### Renouvellement SSL
Le certificat se renouvelle automatiquement. Pour forcer :
```bash
docker compose run --rm certbot renew
docker compose restart frontend
```
