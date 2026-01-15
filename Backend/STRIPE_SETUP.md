# Configuration Stripe pour les Paiements

## 📋 Vue d'ensemble

Ce système utilise Stripe pour gérer les paiements des devis. Le montant est **toujours fixé par vous** dans la table `quotes` (colonne `total_amount`), et le client paie ce montant via Stripe Checkout.

## 1. Installation

Le package Stripe est déjà installé. Si besoin :
```bash
npm install stripe
```

## 2. Configuration des clés Stripe

### Récupérer vos clés API

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com/)
2. En mode Test : Allez dans **Développeurs** > **Clés API**
3. Copiez votre **Clé secrète** (commence par `sk_test_...`)
4. Mettez à jour le fichier `.env` :

```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
CLIENT_URL=http://localhost:5173
```

⚠️ **IMPORTANT** : Votre `.env` contient actuellement une clé `sk_live_...`. Utilisez plutôt `sk_test_...` pour les tests !

## 3. Migration de la base de données

Exécutez le script SQL pour ajouter les colonnes Stripe à votre table `quotes` :

```sql
-- Dans PostgreSQL (pgAdmin, DBeaver, ou ligne de commande)
-- Exécutez le fichier : migrations/add_stripe_columns_to_quotes.sql
```

Ou copiez-collez ce code dans votre outil SQL :

```sql
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_quotes_stripe_session_id ON quotes(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_quotes_stripe_payment_intent_id ON quotes(stripe_payment_intent_id);
```

## 4. Configuration du Webhook

### En développement local (avec Stripe CLI)

1. **Installez Stripe CLI** : [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

2. **Connectez-vous** :
   ```bash
   stripe login
   ```

3. **Lancez le webhook en local** :
   ```bash
   stripe listen --forward-to localhost:4000/api/payments/webhook
   ```

4. **Copiez le secret du webhook** (commence par `whsec_...`) et ajoutez-le dans `.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
   ```

### En production

1. Allez dans **Développeurs** > **Webhooks** dans le Dashboard Stripe
2. Cliquez sur **Ajouter un point de terminaison**
3. URL : `https://votre-domaine.com/api/payments/webhook`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copiez le **Secret de signature** et mettez-le dans `.env`

## 5. Routes API disponibles

### 📤 Créer une session de paiement (Stripe Checkout)
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
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### 📤 Créer un Payment Intent (intégration personnalisée)
```http
POST /api/payments/create-payment-intent
Content-Type: application/json

{
  "quoteId": 1
}
```

### 📊 Vérifier le statut d'un paiement
```http
GET /api/payments/status/:quoteId
```

**Réponse** :
```json
{
  "id": 1,
  "payment_status": "paid",
  "total_amount": "1500.00",
  "stripe_session_id": "cs_test_...",
  "stripe_payment_intent_id": "pi_...",
  "paid_at": "2024-01-15T10:30:00.000Z",
  "status": "accepted"
}
```

### 📜 Historique des paiements d'un utilisateur
```http
GET /api/payments/history/user/:userId
```

### 🔍 Détails d'un paiement Stripe
```http
GET /api/payments/stripe-details/:quoteId
```

### 🔔 Webhook Stripe
```http
POST /api/payments/webhook
```
(Appelé automatiquement par Stripe)

## 6. Structure de la table `quotes`

Colonnes liées au paiement :

| Colonne | Type | Description |
|---------|------|-------------|
| `total_amount` | DECIMAL | **Montant que vous fixez** |
| `payment_status` | VARCHAR | `unpaid`, `pending`, `paid`, `failed` |
| `stripe_session_id` | VARCHAR | ID de la session Stripe Checkout |
| `stripe_payment_intent_id` | VARCHAR | ID du Payment Intent |
| `paid_at` | TIMESTAMP | Date du paiement réussi |

## 7. Flux de paiement complet

### Étape 1 : Créer un devis avec le montant
```sql
INSERT INTO quotes (client, project_id, total_amount, payment_status, ...)
VALUES (1, 1, 1500.00, 'unpaid', ...);
```

### Étape 2 : Le client demande à payer
Frontend appelle :
```javascript
const response = await fetch('http://localhost:4000/api/payments/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ quoteId: 1 })
});

const { url } = await response.json();
window.location.href = url; // Redirection vers Stripe
```

### Étape 3 : Paiement sur Stripe
- Le client entre ses informations de carte
- Stripe traite le paiement
- Le client est redirigé vers votre page de succès

### Étape 4 : Mise à jour automatique
- Stripe envoie un webhook à votre backend
- Le statut du devis passe à `paid`
- La date `paid_at` est enregistrée

## 8. Exemple d'utilisation Frontend

### React / Vue.js

```javascript
// Composant de paiement
const PaymentButton = ({ quoteId }) => {
  const handlePayment = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId })
      });

      const { url } = await response.json();

      // Rediriger vers Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du paiement');
    }
  };

  return <button onClick={handlePayment}>Payer maintenant</button>;
};
```

### Page de succès

```javascript
// /payment/success
const SuccessPage = () => {
  const params = new URLSearchParams(window.location.search);
  const quoteId = params.get('quote_id');
  const sessionId = params.get('session_id');

  useEffect(() => {
    // Vérifier le statut du paiement
    fetch(`http://localhost:4000/api/payments/status/${quoteId}`)
      .then(res => res.json())
      .then(data => {
        console.log('Statut du paiement:', data.payment_status);
      });
  }, [quoteId]);

  return <h1>Paiement réussi ! Merci pour votre confiance.</h1>;
};
```

## 9. Tester les paiements

### Cartes de test Stripe

En mode test, utilisez ces numéros de carte :

| Numéro | Résultat |
|--------|----------|
| `4242 4242 4242 4242` | ✅ Paiement réussi |
| `4000 0000 0000 0002` | ❌ Paiement refusé |
| `4000 0025 0000 3155` | 🔒 3D Secure requis |

- **Date d'expiration** : N'importe quelle date future (ex: 12/25)
- **CVC** : N'importe quel 3 chiffres (ex: 123)
- **Code postal** : N'importe lequel

## 10. Sécurité

✅ **Le montant vient toujours de votre base de données** (table `quotes`)
✅ **Les clés API ne sont jamais exposées au frontend**
✅ **Les webhooks sont vérifiés avec la signature Stripe**
✅ **Les paiements sont liés aux devis existants**
✅ **Tous les statuts sont mis à jour automatiquement**

## 11. Statuts de paiement

| Statut | Description |
|--------|-------------|
| `unpaid` | Devis créé, pas encore payé |
| `pending` | Session de paiement créée, en attente |
| `paid` | Paiement réussi ✅ |
| `failed` | Paiement échoué ❌ |

## 12. Logs et Débogage

### Vérifier les webhooks
1. Dashboard Stripe > Développeurs > Webhooks
2. Cliquez sur votre endpoint
3. Consultez l'onglet "Événements"

### Vérifier les paiements
1. Dashboard Stripe > Paiements
2. Filtrez par date, statut, etc.

### Logs backend
```bash
# Dans la console de votre backend
✅ Paiement réussi pour le devis #1
❌ Paiement échoué pour le devis #2
```

## 13. Passer en Production

1. Dans le Dashboard Stripe, **activez votre compte**
2. Remplacez `sk_test_...` par `sk_live_...` dans `.env`
3. Configurez le webhook de production (URL publique)
4. Testez avec de vraies cartes (petits montants d'abord)
5. Surveillez les logs et les événements dans le Dashboard

## 🆘 Support

- Documentation Stripe : [https://stripe.com/docs](https://stripe.com/docs)
- Stripe CLI : [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- Dashboard Stripe : [https://dashboard.stripe.com](https://dashboard.stripe.com)

## 📝 Résumé

1. ✅ Installez Stripe CLI
2. ✅ Configurez `.env` avec vos clés
3. ✅ Exécutez la migration SQL
4. ✅ Lancez le webhook local : `stripe listen --forward-to localhost:4000/api/payments/webhook`
5. ✅ Testez avec la carte `4242 4242 4242 4242`
6. ✅ Le montant du devis provient toujours de votre table `quotes` !
