# Guide Complet : Générer un Devis et Créer un Lien de Paiement

## 📋 Vue d'ensemble

Ce guide explique comment créer un devis complet et générer automatiquement un **lien de paiement permanent Stripe**.

## 🎯 Workflow complet

```
1. Client contacte → 2. Créer devis → 3. Générer lien paiement → 4. Envoyer au client → 5. Client paie → 6. Webhook met à jour
```

---

## Étape 1 : Créer un utilisateur (client)

Si le client n'existe pas encore dans votre base de données, créez-le d'abord :

### Route API
```http
POST http://localhost:4000/api/users
Content-Type: application/json

{
  "name": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+33612345678",
  "role": "client"
}
```

### Réponse
```json
{
  "id": 1,
  "name": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+33612345678",
  "role": "client",
  "created_at": "2024-01-15T10:00:00.000Z"
}
```

**Gardez l'ID de l'utilisateur** (ici `1`), vous en aurez besoin pour le devis.

---

## Étape 2 : Créer un projet (optionnel mais recommandé)

Un projet permet de regrouper plusieurs devis pour un même client.

### Route API
```http
POST http://localhost:4000/api/projects
Content-Type: application/json

{
  "name": "Site E-commerce avec paiement Stripe",
  "description": "Développement complet d'un site e-commerce avec intégration Stripe",
  "client_id": 1,
  "status": "in_progress"
}
```

### Réponse
```json
{
  "id": 1,
  "name": "Site E-commerce avec paiement Stripe",
  "description": "Développement complet d'un site e-commerce avec intégration Stripe",
  "client_id": 1,
  "status": "in_progress",
  "created_at": "2024-01-15T10:05:00.000Z"
}
```

**Gardez l'ID du projet** (ici `1`).

---

## Étape 3 : Créer un devis avec le montant que VOUS fixez

C'est ici que vous définissez le **montant total** que le client devra payer.

### Route API
```http
POST http://localhost:4000/api/quotes
Content-Type: application/json

{
  "client": 1,
  "project_id": 1,
  "service_type": "Développement Web",
  "description": "Développement d'un site e-commerce complet avec:\n- Design responsive\n- Intégration Stripe\n- Back-office d'administration\n- Hébergement et déploiement",
  "total_amount": 3500.00,
  "payment_status": "unpaid",
  "status": "pending",
  "valid_until": "2024-02-15"
}
```

### Paramètres importants

| Champ | Description | Exemple |
|-------|-------------|---------|
| `client` | ID de l'utilisateur (étape 1) | `1` |
| `project_id` | ID du projet (étape 2) | `1` |
| `service_type` | Type de service | `"Développement Web"` |
| `description` | Description détaillée du devis | `"Développement complet..."` |
| **`total_amount`** | **MONTANT QUE VOUS FIXEZ** (€) | `3500.00` |
| `payment_status` | Statut initial | `"unpaid"` |
| `status` | Statut du devis | `"pending"`, `"accepted"`, `"rejected"` |
| `valid_until` | Date d'expiration du devis | `"2024-02-15"` |

### Réponse
```json
{
  "id": 1,
  "client": 1,
  "project_id": 1,
  "service_type": "Développement Web",
  "description": "Développement d'un site e-commerce complet...",
  "total_amount": "3500.00",
  "payment_status": "unpaid",
  "status": "pending",
  "valid_until": "2024-02-15T00:00:00.000Z",
  "created_at": "2024-01-15T10:10:00.000Z"
}
```

**Gardez l'ID du devis** (ici `1`) pour générer le lien de paiement.

---

## Étape 4 : Générer le lien de paiement Stripe permanent ✅

Maintenant que le devis est créé avec le montant, générez un **lien de paiement permanent**.

### Route API
```http
POST http://localhost:4000/api/payments/create-payment-link
Content-Type: application/json

{
  "quoteId": 1
}
```

### Ce qui se passe en arrière-plan

1. ✅ Le backend récupère le devis avec son `total_amount`
2. ✅ Créé un **produit Stripe** : `"Devis #1 - Site E-commerce"`
3. ✅ Créé un **prix Stripe** : `3500.00 EUR`
4. ✅ Créé un **Payment Link permanent** qui ne expire JAMAIS
5. ✅ Met à jour le devis avec `payment_status = 'pending'`
6. ✅ Stocke l'URL du lien dans `stripe_payment_link`

### Réponse
```json
{
  "paymentLinkId": "plink_1234567890",
  "url": "https://buy.stripe.com/test_xxxxxxxxxxxxxxx",
  "message": "Lien de paiement permanent créé avec succès"
}
```

**Ce lien ne expire JAMAIS !** Vous pouvez l'envoyer au client par email, SMS, WhatsApp, etc.

---

## Étape 5 : Envoyer le lien au client

### Par email
```
Bonjour Jean,

Voici votre devis pour le développement de votre site e-commerce :

📄 Devis #1 - Site E-commerce avec paiement Stripe
💰 Montant total : 3 500,00 €

Pour procéder au paiement en toute sécurité, cliquez sur le lien ci-dessous :
👉 https://buy.stripe.com/test_xxxxxxxxxxxxxxx

Ce lien est sécurisé par Stripe et reste valide indéfiniment.

Cordialement,
Votre équipe
```

### Par SMS
```
Devis #1 - Site E-commerce : 3500€
Paiement sécurisé : https://buy.stripe.com/test_xxx
```

### Afficher sur votre interface

```html
<!-- Dans votre dashboard client -->
<div class="quote-card">
  <h3>Devis #1</h3>
  <p>Montant : 3 500,00 €</p>
  <a href="https://buy.stripe.com/test_xxx" class="btn-pay">
    Payer maintenant avec Stripe
  </a>
</div>
```

---

## Étape 6 : Le client paie (automatique)

1. **Le client clique sur le lien** → Redirigé vers une page Stripe sécurisée
2. **Le client entre ses infos de carte** → Stripe traite le paiement
3. **Paiement réussi** → Stripe redirige vers votre page de succès
4. **Webhook notifie votre backend** → Le devis passe à `payment_status = 'paid'`
5. **Date `paid_at` enregistrée** → Vous savez exactement quand il a payé

### Ce que vous voyez dans votre base de données

**Avant paiement** :
```sql
SELECT * FROM quotes WHERE id = 1;

| id | payment_status | total_amount | stripe_payment_link | paid_at |
|----|----------------|--------------|---------------------|---------|
| 1  | pending        | 3500.00      | https://buy...      | NULL    |
```

**Après paiement** :
```sql
SELECT * FROM quotes WHERE id = 1;

| id | payment_status | total_amount | stripe_payment_link | paid_at             |
|----|----------------|--------------|---------------------|---------------------|
| 1  | paid           | 3500.00      | https://buy...      | 2024-01-15 14:30:00 |
```

---

## 📊 Vérifier le statut du paiement

### Route API
```http
GET http://localhost:4000/api/payments/status/1
```

### Réponse
```json
{
  "id": 1,
  "payment_status": "paid",
  "total_amount": "3500.00",
  "stripe_payment_link": "https://buy.stripe.com/test_xxx",
  "stripe_payment_intent_id": "pi_xxx",
  "paid_at": "2024-01-15T14:30:00.000Z",
  "status": "accepted"
}
```

---

## 📜 Historique des paiements d'un client

### Route API
```http
GET http://localhost:4000/api/payments/history/user/1
```

### Réponse
```json
[
  {
    "id": 1,
    "payment_status": "paid",
    "total_amount": "3500.00",
    "project_name": "Site E-commerce",
    "paid_at": "2024-01-15T14:30:00.000Z",
    "created_at": "2024-01-15T10:10:00.000Z"
  },
  {
    "id": 2,
    "payment_status": "paid",
    "total_amount": "1200.00",
    "project_name": "Maintenance",
    "paid_at": "2024-01-10T09:15:00.000Z",
    "created_at": "2024-01-09T16:00:00.000Z"
  }
]
```

---

## 🔄 Modifier un devis existant

Si vous devez changer le montant d'un devis **avant** que le client ne paie :

### Route API
```http
PUT http://localhost:4000/api/quotes/1
Content-Type: application/json

{
  "total_amount": 4000.00
}
```

⚠️ **Important** : Si vous modifiez le montant après avoir généré le lien de paiement, vous devez :
1. Modifier le devis (API ci-dessus)
2. Régénérer un nouveau lien de paiement (`POST /api/payments/create-payment-link`)
3. Envoyer le nouveau lien au client

---

## 🧪 Tester avec des cartes Stripe de test

En mode test (clé `sk_test_...`), utilisez ces numéros de carte :

| Numéro | Résultat |
|--------|----------|
| `4242 4242 4242 4242` | ✅ Paiement réussi |
| `4000 0000 0000 0002` | ❌ Carte refusée |
| `4000 0025 0000 3155` | 🔒 3D Secure requis |

- **Date d'expiration** : N'importe quelle date future (ex: `12/25`)
- **CVC** : N'importe quel 3 chiffres (ex: `123`)

---

## 📝 Exemple complet avec Postman ou curl

### 1. Créer un client
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33612345678",
    "role": "client"
  }'
```

### 2. Créer un devis
```bash
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "client": 1,
    "project_id": 1,
    "service_type": "Développement Web",
    "description": "Site e-commerce complet",
    "total_amount": 3500.00,
    "payment_status": "unpaid",
    "status": "pending"
  }'
```

### 3. Générer le lien de paiement
```bash
curl -X POST http://localhost:4000/api/payments/create-payment-link \
  -H "Content-Type: application/json" \
  -d '{"quoteId": 1}'
```

### 4. Vérifier le statut
```bash
curl http://localhost:4000/api/payments/status/1
```

---

## 🎯 Résumé du workflow

1. ✅ **Créer un utilisateur** → Récupérer son ID
2. ✅ **Créer un projet** (optionnel) → Récupérer son ID
3. ✅ **Créer un devis** avec le `total_amount` que vous fixez
4. ✅ **Générer le lien de paiement permanent** avec l'ID du devis
5. ✅ **Envoyer le lien au client** par email/SMS/WhatsApp
6. ✅ **Le client paie** → Webhook met à jour automatiquement
7. ✅ **Vérifier le statut** quand vous voulez

---

## ❓ FAQ

### Le lien expire-t-il ?
**Non** ! Les Payment Links Stripe sont **permanents** et ne expirent jamais.

### Puis-je utiliser le même lien pour plusieurs clients ?
**Non**. Chaque lien est lié à un devis spécifique avec un montant fixe.

### Que se passe-t-il si je modifie le montant du devis ?
Vous devez **régénérer un nouveau lien** de paiement avec le nouveau montant.

### Le client peut-il payer plusieurs fois ?
**Non**. Une fois payé (`payment_status = 'paid'`), le système refuse les nouveaux paiements.

### Comment annuler un lien de paiement ?
Vous pouvez désactiver le lien dans le [Stripe Dashboard](https://dashboard.stripe.com/payment-links) ou changer le `payment_status` du devis à `"cancelled"`.

### Puis-je suivre qui a cliqué sur le lien ?
Oui, dans le Stripe Dashboard > Payment Links, vous pouvez voir les statistiques de clics et de conversions.

---

## 🆘 Support

- Routes API : Voir [STRIPE_SETUP.md](STRIPE_SETUP.md)
- Stripe Dashboard : [https://dashboard.stripe.com](https://dashboard.stripe.com)
- Documentation Stripe : [https://stripe.com/docs/payment-links](https://stripe.com/docs/payment-links)
