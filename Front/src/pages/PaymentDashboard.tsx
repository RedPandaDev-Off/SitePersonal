import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  FileText,
  Loader2,
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface DashboardStats {
  total_quotes: number;
  quotes_by_status: {
    pending: number;
    accepted: number;
    rejected: number;
  };
  payments: {
    unpaid: number;
    pending: number;
    paid: number;
    failed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    pending: number;
    unpaid: number;
  };
}

interface Quote {
  id: number;
  payment_status: string;
  total_amount: string;
  paid_at: string | null;
  created_at: string;
  service_type: string;
  description: string;
  status: string;
  stripe_payment_link: string | null;
  project_name: string;
  client_name: string;
  client_email: string;
}

interface MonthlyStats {
  month: string;
  total_quotes: string;
  paid_quotes: string;
  revenue: string;
}

interface TopClient {
  id: number;
  name: string;
  email: string;
  total_quotes: string;
  paid_quotes: string;
  total_revenue: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentPayments: Quote[];
  pendingPayments: Quote[];
  unpaidQuotes: Quote[];
  monthlyStats: MonthlyStats[];
  topClients: TopClient[];
  allQuotes: Quote[];
}

const PaymentDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/payments/admin/dashboard');
      if (!response.ok) throw new Error('Erreur lors du chargement du dashboard');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500/10 text-green-500 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      unpaid: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
      cancelled: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
    return colors[status] || colors.unpaid;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Erreur de chargement</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchDashboard} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-gradient">Dashboard Paiements</h1>
              <p className="text-sm text-muted-foreground">Vue d'ensemble des devis et paiements</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDashboard}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(data.stats.revenue.total)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.stats.payments.paid} devis payés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {formatCurrency(data.stats.revenue.pending)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.stats.payments.pending} devis en attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impayés</CardTitle>
              <AlertCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">
                {formatCurrency(data.stats.revenue.unpaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.stats.payments.unpaid} devis impayés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total devis</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.total_quotes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.stats.quotes_by_status.accepted} acceptés
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Derniers paiements */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Derniers paiements
              </CardTitle>
              <CardDescription>Les 5 derniers paiements reçus</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun paiement pour le moment
                </p>
              ) : (
                <div className="space-y-4">
                  {data.recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{payment.client_name}</p>
                        <p className="text-xs text-muted-foreground">{payment.service_type}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(payment.paid_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(payment.total_amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paiements en attente */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                En attente de paiement ({data.pendingPayments.length})
              </CardTitle>
              <CardDescription>Devis avec lien de paiement généré</CardDescription>
            </CardHeader>
            <CardContent>
              {data.pendingPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun paiement en attente
                </p>
              ) : (
                <div className="space-y-3">
                  {data.pendingPayments.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                      <div className="flex-1">
                        <p className="font-medium">{quote.client_name}</p>
                        <p className="text-sm text-muted-foreground">{quote.project_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Créé le {formatDate(quote.created_at)}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <p className="font-bold">{formatCurrency(quote.total_amount)}</p>
                        {quote.stripe_payment_link && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(quote.stripe_payment_link!, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Devis impayés */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-500" />
              Devis impayés ({data.unpaidQuotes.length})
            </CardTitle>
            <CardDescription>Devis créés mais sans lien de paiement</CardDescription>
          </CardHeader>
          <CardContent>
            {data.unpaidQuotes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Tous les devis ont un lien de paiement
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.unpaidQuotes.map((quote) => (
                  <div key={quote.id} className="p-4 rounded-lg border border-border/50 bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{quote.client_name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(quote.payment_status)}`}>
                        {quote.payment_status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{quote.service_type}</p>
                    <p className="font-bold text-lg mt-2">{formatCurrency(quote.total_amount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(quote.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top clients */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Top Clients
            </CardTitle>
            <CardDescription>Classement par revenus générés</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun client pour le moment
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Client</th>
                      <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Devis totaux</th>
                      <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Payés</th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Revenus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topClients.map((client, index) => (
                      <tr key={client.id} className="border-b border-border/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-xs text-muted-foreground">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">{client.total_quotes}</td>
                        <td className="text-center py-3 px-4">
                          <span className="text-green-600 font-medium">{client.paid_quotes}</span>
                        </td>
                        <td className="text-right py-3 px-4 font-bold text-primary">
                          {formatCurrency(client.total_revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques mensuelles */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Évolution mensuelle
            </CardTitle>
            <CardDescription>Statistiques des 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            {data.monthlyStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Pas encore de données mensuelles
              </p>
            ) : (
              <div className="space-y-4">
                {data.monthlyStats.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {month.total_quotes} devis · {month.paid_quotes} payés
                      </p>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(month.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tous les devis */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tous les devis ({data.allQuotes.length})</CardTitle>
            <CardDescription>Liste complète de tous les devis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Projet</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Montant</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Statut</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Paiement</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.allQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm">#{quote.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{quote.client_name}</p>
                        <p className="text-xs text-muted-foreground">{quote.client_email}</p>
                      </td>
                      <td className="py-3 px-4 text-sm">{quote.project_name || quote.service_type}</td>
                      <td className="py-3 px-4 text-right font-bold">{formatCurrency(quote.total_amount)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${quote.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(quote.payment_status)}`}>
                          {quote.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                        {formatDate(quote.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentDashboard;
