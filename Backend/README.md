# Backend API - SitePro

Backend Node.js avec Express, PostgreSQL et intégration Stripe pour la gestion des paiements.

## 📋 Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Routes API](#routes-api)
  - [Utilisateurs](#utilisateurs)
  - [Projets](#projets)
  - [Devis (Quotes)](#devis-quotes)
  - [Paiements Stripe](#paiements-stripe)
- [Documentation détaillée](#documentation-détaillée)

---

## 🚀 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du dossier `backend` :

```env
# Base de données PostgreSQL
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=sitepro
DB_HOST=localhost
DB_PORT=5432

# Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# Client (Frontend)
CLIENT_URL=http://localhost:5173

# Port du serveur
PORT=4000
```

### 2. Base de données

Créez la base de données et exécutez les migrations :

```bash
# Créer la base de données
createdb sitepro

# Exécuter les migrations
psql -U postgres -d sitepro -f migrations/add_stripe_columns_to_quotes.sql
```

---

## 🏃 Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:4000`

---

## 📡 Routes API

### 🏠 Route de base

```http
GET /api/home
```

Retourne un message de bienvenue.

---

### 👥 Utilisateurs

#### Créer un utilisateur
```http
POST /api/users
Content-Type: application/json

{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "role": "client"
}
```

#### Récupérer tous les utilisateurs
```http
GET /api/users
```

#### Récupérer un utilisateur par ID
```http
GET /api/users/:id
```

---

### 📁 Projets

#### Créer un projet
```http
POST /api/projects
Content-Type: application/json

{
  "name": "Site E-commerce",
  "description": "Développement d'un site e-commerce complet",
  "client_id": 1,
  "status": "in_progress"
}
```

#### Récupérer tous les projets
```http
GET /api/projects
```

#### Récupérer un projet par ID
```http
GET /api/projects/:id
```

---

### 📄 Devis (Quotes)

#### Créer un devis
```http
POST /api/quotes
Content-Type: application/json

{
  "client": 1,
  "project_id": 1,
  "service_type": "Développement Web",
  "description": "Développement complet d'un site e-commerce",
  "total_amount": 3500.00,
  "payment_status": "unpaid",
  "status": "pending"
}
```

#### Récupérer tous les devis
```http
GET /api/quotes
```

#### Récupérer un devis par ID
```http
GET /api/quotes/:id
```

#### Récupérer les devis d'un utilisateur
```http
GET /api/quotes/user/:userId
```

#### Récupérer les devis par statut
```http
GET /api/quotes/status/:status
```

Statuts possibles : `pending`, `accepted`, `rejected`

#### Récupérer les devis par statut de paiement
```http
GET /api/quotes/payment-status/:paymentStatus
```

Statuts de paiement : `unpaid`, `pending`, `paid`, `failed`, `cancelled`

#### Mettre à jour un devis
```http
PUT /api/quotes/:id
Content-Type: application/json

{
  "total_amount": 4000.00,
  "status": "accepted"
}
```

---

### 💳 Paiements Stripe

#### ✅ Créer un Payment Link permanent (RECOMMANDÉ)

Créer un lien de paiement **permanent** qui ne expire jamais.

```http
POST /api/payments/create-payment-link
Content-Type: application/json

{
  "quoteId": 1
}
```

**Réponse** :
```json
{
  "paymentLinkId": "plink_xxxxx",
  "url": "https://buy.stripe.com/test_xxxxxxxx",
  "message": "Lien de paiement permanent créé avec succès",
  "quoteId": 1,
  "amount": "3500.00"
}
```

**Avantages** :
- ✅ Le lien ne expire JAMAIS
- ✅ Peut être envoyé par email, SMS, WhatsApp
- ✅ Facile à partager
- ✅ Hébergé et sécurisé par Stripe

---

#### Créer une Checkout Session (Alternative)

Session temporaire qui **expire après 24h**.

```http
POST /api/payments/create-checkout-session
Content-Type: application/json

{
  "quoteId": 1
}
```

**Réponse** :
```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx",
  "message": "Session de paiement créée avec succès (expire dans 24h)",
  "quoteId": 1,
  "amount": "3500.00"
}
```

---

#### Vérifier le statut d'un paiement

```http
GET /api/payments/status/:quoteId
```

**Réponse** :
```json
{
  "id": 1,
  "payment_status": "paid",
  "total_amount": "3500.00",
  "stripe_payment_link": "https://buy.stripe.com/test_xxx",
  "stripe_session_id": "cs_test_xxx",
  "stripe_payment_intent_id": "pi_xxx",
  "paid_at": "2024-01-15T14:30:00.000Z",
  "status": "accepted",
  "client_name": "Jean Dupont",
  "client_email": "jean@example.com",
  "project_name": "Site E-commerce"
}
```

---

#### Historique des paiements d'un utilisateur

```http
GET /api/payments/history/user/:userId
```

**Réponse** :
```json
{
  "total": 2,
  "payments": [
    {
      "id": 1,
      "payment_status": "paid",
      "total_amount": "3500.00",
      "paid_at": "2024-01-15T14:30:00.000Z",
      "service_type": "Développement Web",
      "project_name": "Site E-commerce"
    }
  ]
}
```

---

#### Récupérer tous les paiements (Admin)

```http
GET /api/payments/all
GET /api/payments/all?status=paid
```

**Réponse** :
```json
{
  "stats": {
    "total_quotes": 10,
    "total_paid": 6,
    "total_pending": 2,
    "total_unpaid": 1,
    "total_failed": 1,
    "total_revenue": 18500.00
  },
  "quotes": [...]
}
```

---

#### Détails Stripe d'un paiement

```http
GET /api/payments/stripe-details/:quoteId
```

Récupère les détails complets depuis l'API Stripe.

---

#### Désactiver un Payment Link

```http
DELETE /api/payments/payment-link/:quoteId
```

**Réponse** :
```json
{
  "message": "Lien de paiement désactivé avec succès",
  "quoteId": 1
}
```

---

### 🔔 Webhook Stripe

```http
POST /api/payments/webhook
```

Cette route est appelée **automatiquement par Stripe** lors d'événements de paiement.

**Événements gérés** :
- `checkout.session.completed` - Session de paiement terminée
- `payment_intent.succeeded` - Paiement réussi
- `payment_intent.payment_failed` - Paiement échoué

Le webhook met automatiquement à jour le statut du devis dans la base de données.

---

## 📚 Documentation détaillée

- **[GUIDE_DEVIS.md](GUIDE_DEVIS.md)** - Guide complet pour créer un devis et générer un lien de paiement
- **[STRIPE_SETUP.md](STRIPE_SETUP.md)** - Configuration de Stripe (clés API, webhook, etc.)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide de déploiement sur Hostinger avec Docker

---

## 🧪 Tests

### Cartes de test Stripe

En mode test (`sk_test_...`), utilisez ces numéros de carte :

| Numéro | Résultat |
|--------|----------|
| `4242 4242 4242 4242` | ✅ Paiement réussi |
| `4000 0000 0000 0002` | ❌ Carte refusée |
| `4000 0025 0000 3155` | 🔒 3D Secure requis |

- **Date d'expiration** : N'importe quelle date future (ex: `12/25`)
- **CVC** : N'importe quel 3 chiffres (ex: `123`)

---

## 🔒 Sécurité

- ✅ Le montant provient **toujours** de la base de données (jamais du client)
- ✅ Les clés Stripe ne sont jamais exposées au frontend
- ✅ Les webhooks sont vérifiés avec la signature Stripe
- ✅ Tous les paiements sont tracés et loggés

---

## 📊 Structure de la base de données

### Table `quotes`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | ID unique |
| `client` | INTEGER | ID de l'utilisateur (FK) |
| `project_id` | INTEGER | ID du projet (FK) |
| `service_type` | VARCHAR | Type de service |
| `description` | TEXT | Description détaillée |
| **`total_amount`** | DECIMAL | **Montant que vous fixez** |
| `payment_status` | VARCHAR | `unpaid`, `pending`, `paid`, `failed`, `cancelled` |
| `status` | VARCHAR | `pending`, `accepted`, `rejected` |
| `stripe_session_id` | VARCHAR | ID de la session Checkout |
| `stripe_payment_intent_id` | VARCHAR | ID du Payment Intent |
| `stripe_payment_link` | TEXT | URL du Payment Link permanent |
| `paid_at` | TIMESTAMP | Date du paiement |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

---

## 🆘 Support

- Stripe Dashboard : [https://dashboard.stripe.com](https://dashboard.stripe.com)
- Documentation Stripe : [https://stripe.com/docs](https://stripe.com/docs)
- Issues GitHub : Créez une issue si vous rencontrez un problème

---

## 📝 Licence

Propriétaire
