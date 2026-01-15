# Dashboard Admin - Guide d'utilisation

## 🎯 URL principale du Dashboard

```
GET http://localhost:4000/api/payments/admin/dashboard
```

Cette route unique retourne **TOUTES** les données nécessaires pour votre dashboard admin.

---

## 📊 Structure de la réponse

```json
{
  "stats": {
    "total_quotes": 25,
    "quotes_by_status": {
      "pending": 10,
      "accepted": 12,
      "rejected": 3
    },
    "payments": {
      "unpaid": 8,
      "pending": 5,
      "paid": 10,
      "failed": 1,
      "cancelled": 1
    },
    "revenue": {
      "total": 35000.00,
      "pending": 12500.00,
      "unpaid": 8000.00
    }
  },
  "recentPayments": [...],
  "pendingPayments": [...],
  "unpaidQuotes": [...],
  "monthlyStats": [...],
  "topClients": [...],
  "allQuotes": [...]
}
```

---

## 📈 Sections du Dashboard

### 1. **Statistiques globales** (`stats`)

Affiche les KPI principaux :

```json
{
  "total_quotes": 25,
  "quotes_by_status": {
    "pending": 10,
    "accepted": 12,
    "rejected": 3
  },
  "payments": {
    "unpaid": 8,
    "pending": 5,
    "paid": 10,
    "failed": 1,
    "cancelled": 1
  },
  "revenue": {
    "total": 35000.00,
    "pending": 12500.00,
    "unpaid": 8000.00
  }
}
```

**Comment l'afficher dans votre frontend** :

```jsx
// React / Vue / Svelte
<div className="stats-grid">
  <StatCard
    title="Total des devis"
    value={data.stats.total_quotes}
    icon="📄"
  />
  <StatCard
    title="Devis payés"
    value={data.stats.payments.paid}
    icon="✅"
    color="green"
  />
  <StatCard
    title="En attente"
    value={data.stats.payments.pending}
    icon="⏳"
    color="orange"
  />
  <StatCard
    title="Revenu total"
    value={`${data.stats.revenue.total.toFixed(2)} €`}
    icon="💰"
    color="blue"
  />
</div>
```

---

### 2. **Derniers paiements** (`recentPayments`)

Les 5 derniers paiements réussis :

```json
[
  {
    "id": 15,
    "payment_status": "paid",
    "total_amount": "3500.00",
    "paid_at": "2024-01-15T14:30:00.000Z",
    "service_type": "Développement Web",
    "client_name": "Jean Dupont",
    "client_email": "jean@example.com",
    "project_name": "Site E-commerce"
  }
]
```

**Comment l'afficher** :

```jsx
<div className="recent-payments">
  <h3>Derniers paiements</h3>
  {data.recentPayments.map(payment => (
    <div key={payment.id} className="payment-item">
      <div className="payment-info">
        <strong>{payment.client_name}</strong>
        <span>{payment.service_type}</span>
      </div>
      <div className="payment-amount">
        {parseFloat(payment.total_amount).toFixed(2)} €
      </div>
      <div className="payment-date">
        {new Date(payment.paid_at).toLocaleDateString('fr-FR')}
      </div>
    </div>
  ))}
</div>
```

---

### 3. **Paiements en attente** (`pendingPayments`)

Tous les devis avec un lien de paiement généré mais pas encore payés :

```json
[
  {
    "id": 18,
    "payment_status": "pending",
    "total_amount": "2500.00",
    "stripe_payment_link": "https://buy.stripe.com/test_xxx",
    "created_at": "2024-01-14T10:00:00.000Z",
    "client_name": "Marie Martin",
    "client_email": "marie@example.com",
    "project_name": "Refonte site vitrine"
  }
]
```

**Comment l'afficher** :

```jsx
<div className="pending-payments">
  <h3>En attente de paiement ({data.pendingPayments.length})</h3>
  {data.pendingPayments.map(quote => (
    <div key={quote.id} className="pending-item">
      <div>
        <strong>{quote.client_name}</strong>
        <span>{quote.project_name}</span>
      </div>
      <div>{parseFloat(quote.total_amount).toFixed(2)} €</div>
      <a
        href={quote.stripe_payment_link}
        target="_blank"
        className="btn-view-link"
      >
        Voir le lien
      </a>
    </div>
  ))}
</div>
```

---

### 4. **Devis impayés** (`unpaidQuotes`)

Devis créés mais sans lien de paiement généré :

```json
[
  {
    "id": 20,
    "payment_status": "unpaid",
    "total_amount": "4500.00",
    "created_at": "2024-01-13T09:00:00.000Z",
    "client_name": "Pierre Dubois",
    "service_type": "Application mobile"
  }
]
```

**Comment l'afficher** :

```jsx
<div className="unpaid-quotes">
  <h3>Devis à envoyer ({data.unpaidQuotes.length})</h3>
  {data.unpaidQuotes.map(quote => (
    <div key={quote.id} className="unpaid-item">
      <div>
        <strong>{quote.client_name}</strong>
        <span>{quote.service_type}</span>
      </div>
      <div>{parseFloat(quote.total_amount).toFixed(2)} €</div>
      <button
        onClick={() => generatePaymentLink(quote.id)}
        className="btn-generate"
      >
        Générer le lien
      </button>
    </div>
  ))}
</div>
```

---

### 5. **Statistiques mensuelles** (`monthlyStats`)

Évolution des revenus sur les 6 derniers mois :

```json
[
  {
    "month": "2024-01",
    "total_quotes": 8,
    "paid_quotes": 5,
    "revenue": "12500.00"
  },
  {
    "month": "2023-12",
    "total_quotes": 6,
    "paid_quotes": 4,
    "revenue": "9800.00"
  }
]
```

**Comment l'afficher (avec Chart.js)** :

```jsx
import { Line } from 'react-chartjs-2';

const chartData = {
  labels: data.monthlyStats.map(m => m.month),
  datasets: [{
    label: 'Revenus mensuels (€)',
    data: data.monthlyStats.map(m => parseFloat(m.revenue)),
    borderColor: 'rgb(75, 192, 192)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
  }]
};

<Line data={chartData} />
```

---

### 6. **Top clients** (`topClients`)

Les 10 meilleurs clients par revenus :

```json
[
  {
    "id": 3,
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "total_quotes": 5,
    "paid_quotes": 4,
    "total_revenue": "15000.00"
  }
]
```

**Comment l'afficher** :

```jsx
<div className="top-clients">
  <h3>Top Clients</h3>
  <table>
    <thead>
      <tr>
        <th>Client</th>
        <th>Devis</th>
        <th>Payés</th>
        <th>Revenu total</th>
      </tr>
    </thead>
    <tbody>
      {data.topClients.map(client => (
        <tr key={client.id}>
          <td>
            <strong>{client.name}</strong>
            <br />
            <small>{client.email}</small>
          </td>
          <td>{client.total_quotes}</td>
          <td>{client.paid_quotes}</td>
          <td>{parseFloat(client.total_revenue).toFixed(2)} €</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### 7. **Tous les devis** (`allQuotes`)

Liste complète de tous les devis avec tous les détails :

```json
[
  {
    "id": 1,
    "payment_status": "paid",
    "total_amount": "3500.00",
    "paid_at": "2024-01-15T14:30:00.000Z",
    "created_at": "2024-01-10T10:00:00.000Z",
    "service_type": "Développement Web",
    "description": "Site e-commerce complet",
    "status": "accepted",
    "stripe_payment_link": "https://buy.stripe.com/test_xxx",
    "project_name": "Site E-commerce",
    "client_name": "Jean Dupont",
    "client_email": "jean@example.com",
    "client_phone": "+33612345678"
  }
]
```

**Comment l'afficher (tableau)** :

```jsx
<table className="quotes-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Client</th>
      <th>Projet</th>
      <th>Montant</th>
      <th>Statut paiement</th>
      <th>Date</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {data.allQuotes.map(quote => (
      <tr key={quote.id}>
        <td>#{quote.id}</td>
        <td>{quote.client_name}</td>
        <td>{quote.project_name}</td>
        <td>{parseFloat(quote.total_amount).toFixed(2)} €</td>
        <td>
          <span className={`badge ${quote.payment_status}`}>
            {quote.payment_status}
          </span>
        </td>
        <td>{new Date(quote.created_at).toLocaleDateString('fr-FR')}</td>
        <td>
          <button onClick={() => viewDetails(quote.id)}>
            Voir
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 🔧 Exemple complet avec React

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/payments/admin/dashboard');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="admin-dashboard">
      {/* 1. KPI Cards */}
      <div className="kpi-section">
        <div className="kpi-card">
          <h3>Revenus totaux</h3>
          <div className="amount">{data.stats.revenue.total.toFixed(2)} €</div>
        </div>
        <div className="kpi-card">
          <h3>Devis payés</h3>
          <div className="count">{data.stats.payments.paid}</div>
        </div>
        <div className="kpi-card">
          <h3>En attente</h3>
          <div className="count">{data.stats.payments.pending}</div>
        </div>
        <div className="kpi-card">
          <h3>Impayés</h3>
          <div className="count">{data.stats.payments.unpaid}</div>
        </div>
      </div>

      {/* 2. Derniers paiements */}
      <div className="section">
        <h2>Derniers paiements</h2>
        {data.recentPayments.map(payment => (
          <div key={payment.id} className="payment-row">
            <span>{payment.client_name}</span>
            <span>{parseFloat(payment.total_amount).toFixed(2)} €</span>
            <span>{new Date(payment.paid_at).toLocaleDateString('fr-FR')}</span>
          </div>
        ))}
      </div>

      {/* 3. Paiements en attente */}
      <div className="section">
        <h2>En attente de paiement</h2>
        {data.pendingPayments.map(quote => (
          <div key={quote.id} className="pending-row">
            <span>{quote.client_name}</span>
            <span>{parseFloat(quote.total_amount).toFixed(2)} €</span>
            <a href={quote.stripe_payment_link} target="_blank">
              Voir le lien
            </a>
          </div>
        ))}
      </div>

      {/* 4. Top clients */}
      <div className="section">
        <h2>Top Clients</h2>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Devis payés</th>
              <th>Revenu</th>
            </tr>
          </thead>
          <tbody>
            {data.topClients.map(client => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.paid_quotes}</td>
                <td>{parseFloat(client.total_revenue).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
```

---

## 📱 Routes complémentaires

### Filtrer les paiements par statut

```http
GET http://localhost:4000/api/payments/all?status=paid
GET http://localhost:4000/api/payments/all?status=pending
```

### Vérifier un devis spécifique

```http
GET http://localhost:4000/api/payments/status/:quoteId
```

---

## 🎨 Exemple de CSS

```css
.admin-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.kpi-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.kpi-card h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
}

.kpi-card .amount,
.kpi-card .count {
  font-size: 32px;
  font-weight: bold;
  color: #2563eb;
}

.section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.section h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge.paid {
  background: #d1fae5;
  color: #065f46;
}

.badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.badge.unpaid {
  background: #fee2e2;
  color: #991b1b;
}
```

---

## 🚀 Testez maintenant !

Ouvrez votre navigateur et allez sur :

```
http://localhost:4000/api/payments/admin/dashboard
```

Vous verrez immédiatement toutes les données JSON ! 🎉

---

## 💡 Conseils

1. **Rafraîchissement automatique** : Ajoutez un `setInterval` pour rafraîchir les données toutes les 30 secondes
2. **Filtres** : Ajoutez des filtres par date, statut, client
3. **Notifications** : Affichez une notification quand un nouveau paiement arrive
4. **Export** : Ajoutez un bouton pour exporter en CSV/PDF
5. **Recherche** : Ajoutez une barre de recherche pour filtrer les devis

---

## 📞 Support

Si vous avez des questions sur l'intégration du dashboard, consultez le [README.md](README.md) principal.
