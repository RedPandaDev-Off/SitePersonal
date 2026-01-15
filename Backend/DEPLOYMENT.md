# Déploiement sur Hostinger avec Docker

## 📋 Prérequis

- Compte Hostinger avec accès VPS
- Docker et Docker Compose installés sur le serveur
- Domaine configuré pointant vers votre VPS

## 🐳 Fichiers Docker créés

✅ **Dockerfile** - Image Docker du backend Node.js
✅ **docker-compose.yml** - Orchestration backend + PostgreSQL
✅ **.dockerignore** - Fichiers à exclure du build
✅ **.env.production.example** - Template des variables d'environnement

## 🚀 Déploiement sur Hostinger

### Étape 1 : Connexion au VPS Hostinger

```bash
ssh root@votre-ip-hostinger
```

### Étape 2 : Installer Docker (si pas déjà installé)

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
apt install docker-compose

# Vérifier l'installation
docker --version
docker-compose --version
```

### Étape 3 : Transférer votre projet

**Option A : Via Git**
```bash
git clone https://github.com/votre-repo/sitepro.git
cd sitepro/backend
```

**Option B : Via SCP**
```bash
# Sur votre machine locale
scp -r backend root@votre-ip-hostinger:/root/sitepro/
```

### Étape 4 : Configurer les variables d'environnement

```bash
cd /root/sitepro/backend
nano .env
```

Copiez et modifiez :

```env
# Stripe PRODUCTION
STRIPE_SECRET_KEY=sk_live_votre_vraie_cle
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_production

# URL du frontend
CLIENT_URL=https://votre-domaine.com

# PostgreSQL
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_securise
DB_NAME=sitepro
DB_HOST=postgres
DB_PORT=5432

PORT=4000
```

### Étape 5 : Lancer avec Docker Compose

```bash
# Construire et démarrer
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f backend

# Vérifier le statut
docker-compose ps
```

### Étape 6 : Exécuter les migrations SQL

```bash
# Via fichier SQL
docker exec -i sitepro-postgres psql -U postgres -d sitepro < migrations/add_stripe_columns_to_quotes.sql
```

### Étape 7 : Configurer Nginx (reverse proxy)

```bash
apt install nginx
nano /etc/nginx/sites-available/sitepro
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/sitepro /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Étape 8 : SSL avec Let's Encrypt

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d votre-domaine.com
```

### Étape 9 : Configurer le webhook Stripe

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) > Ajouter un endpoint
2. URL : `https://votre-domaine.com/api/payments/webhook`
3. Événements : `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copiez le secret (`whsec_...`) dans votre `.env`
5. Redémarrez : `docker-compose restart backend`

## 🔄 Commandes utiles

```bash
# Logs
docker-compose logs -f backend

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Rebuild
docker-compose up -d --build

# Backup DB
docker exec sitepro-postgres pg_dump -U postgres sitepro > backup.sql
```

## 🔒 Sécurité

```bash
# Firewall
apt install ufw
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

## 🧪 Test

```bash
curl https://votre-domaine.com/api/home
```

## 🎯 Checklist

1. ✅ `.env` avec vraies clés de production
2. ✅ `docker-compose up -d --build`
3. ✅ Nginx + SSL configurés
4. ✅ Webhook Stripe avec URL publique
5. ✅ Test de paiement

---

**Important** : Le webhook Stripe sera automatiquement géré via votre URL publique en production. Pas besoin de Stripe CLI !
