import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { pdf } from "@react-pdf/renderer";
import QuotePDF from "../components/QuotePDF";

import {
  LogOut,
  RefreshCw,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
  FileText,
  TrendingUp,
  AlertCircle,
  Users,
  ExternalLink,
  CreditCard,
  Download,
} from "lucide-react";

interface Quote {
  id: string;
  client_id?: number | string;
  name: string;
  email: string;
  service_type: string;
  budget_range: string;
  timeline: string;
  description: string;
  status: string;
  payment_status: string | null;
  deposit_amount: number | null;
  admin_notes: string | null;
  quoted_amount: number | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  reviewed: "bg-blue-500/20 text-blue-500",
  quoted: "bg-purple-500/20 text-purple-500",
  deposit_received: "bg-green-500/20 text-green-500",
  in_progress: "bg-cyan-500/20 text-cyan-500",
  completed: "bg-emerald-500/20 text-emerald-500",
  rejected: "bg-red-500/20 text-red-500",
};

const paymentColors: Record<string, string> = {
  unpaid: "bg-gray-500/20 text-gray-400",
  pending: "bg-yellow-500/20 text-yellow-500",
  paid: "bg-green-500/20 text-green-500",
};

// Ajoutons des champs mock pour les stats business
interface QuoteWithStats extends Quote {
  hours_worked?: number;
  expenses?: number;
  items?: { description: string; quantity: number; unitPrice: number }[];
}

// Interfaces pour le Payment Dashboard
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

interface PaymentQuote {
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

interface PaymentDashboardData {
  stats: DashboardStats;
  recentPayments: PaymentQuote[];
  pendingPayments: PaymentQuote[];
  unpaidQuotes: PaymentQuote[];
  monthlyStats: MonthlyStats[];
  topClients: TopClient[];
  allQuotes: PaymentQuote[];
}

const Admin = () => {
  // Auth logic removed
  const [quotes, setQuotes] = useState<QuoteWithStats[]>([]);
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [activeTab, setActiveTab] = useState("quotes");

  // Payment Dashboard state
  const [paymentData, setPaymentData] = useState<PaymentDashboardData | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  // Utilisateurs réels depuis l'API
  interface User {
    id: number | string;
    name: string;
    email: string;
  }
  const [users, setUsers] = useState<User[]>([]);
    // Charger les utilisateurs depuis l'API au montage
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const res = await fetch("http://localhost:4000/api/users");
          if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
          const data = await res.json();
          setUsers(data);
          console.log('Utilisateurs récupérés:', data);
        } catch {
          setUsers([]);
        }
      };
      fetchUsers();
    }, []);
  const [selectedUserId, setSelectedUserId] = useState<number | 'new' | null>(null);
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  const [newQuote, setNewQuote] = useState({
    name: '',
    email: '',
    service_type: '',
    budget_range: '',
    timeline: '',
    description: '',
  });
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithStats | null>(null);
  const [quotedAmount, setQuotedAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  

  // Charge les devis depuis l'API
  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/quotes");
      if (!res.ok) throw new Error("Erreur lors du chargement des devis");
      const data = await res.json();
      setQuotes(data);
    } catch {
      setQuotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchQuotes());
  }, []);

  // Payment Dashboard functions
  const fetchPaymentDashboard = async () => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const response = await fetch('http://localhost:4000/api/payments/admin/dashboard');
      if (!response.ok) throw new Error('Erreur lors du chargement du dashboard');
      const result = await response.json();
      setPaymentData(result);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payments' && !paymentData) {
      fetchPaymentDashboard();
    }
  }, [activeTab, paymentData]);

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

  const getPaymentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500/10 text-green-500 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      unpaid: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
      cancelled: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
    return colors[status] || colors.unpaid;
  };

  const handleSelectQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setQuotedAmount(quote.quoted_amount?.toString() || "");
    setAdminNotes(quote.admin_notes || "");
    setNewStatus(quote.status);
  };

  const handleSaveQuote = async () => {
    if (!selectedQuote) return;
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      // Toast removed: Quote updated successfully
      fetchQuotes();
      setSelectedQuote({ 
        ...selectedQuote, 
        quoted_amount: quotedAmount ? parseInt(quotedAmount) * 100 : null,
        admin_notes: adminNotes,
        status: newStatus,
      });
      setIsSaving(false);
    }, 800);
  };

  const handleSendPaymentRequest = async () => {
    if (!selectedQuote || !quotedAmount) return;
    setIsSendingPayment(true);
    // Simulate payment link creation

  };

  const handleDownloadPDF = async () => {
    if (!selectedQuote) return;
    setIsGeneratingPDF(true);
    try {
      const blob = await pdf(<QuotePDF quote={selectedQuote} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${selectedQuote.id}-${selectedQuote.name.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Statistiques business
  const totalRevenue = quotes.filter(q => q.payment_status === 'paid').reduce((sum, q) => sum + (q.quoted_amount || 0), 0);
  const totalExpenses = quotes.reduce((sum, q) => sum + (q.expenses || 0), 0);
  const totalHours = quotes.reduce((sum, q) => sum + (q.hours_worked || 0), 0);
  const completedProjects = quotes.filter(q => q.status === 'completed').length;

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    let client = null;
    try {
      if (selectedUserId === 'new') {
        // Créer le client via l'API
        const res = await fetch("http://localhost:4000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newClient),
        });
        if (!res.ok) throw new Error("Erreur lors de la création du client");
        client = await res.json();
        setUsers([client, ...users]);
      } else {
        client = users.find(u => Number(u.id) === Number(selectedUserId)) || { name: newQuote.name, email: newQuote.email };
      }
      console.log('Client utilisé pour le devis:', client);
      const clientId = typeof client.id === 'string' ? parseInt(client.id, 10) : client.id;
      if (!clientId) {
        alert('Erreur : aucun client sélectionné ou id client invalide.');
        setCreating(false);
        return;
      }
      const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      // Récupère l'id de l'utilisateur connecté depuis localStorage (clé 'user')
      let createdBy = null;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          createdBy = userObj.id || userObj.user?.id || null;
          if (createdBy) createdBy = Number(createdBy);
        }
      } catch {
        // Intentionally ignore JSON parse errors for user info
      }
      if (!createdBy || isNaN(createdBy)) {
        console.warn('Aucun admin connecté ou id admin invalide, created_by sera null.');
        createdBy = null;
      }
      const quoteToSend = {
        ...newQuote,
        name: client.name,
        email: client.email,
        status: 'pending',
        payment_status: 'unpaid',
        deposit_amount: 0,
        admin_notes: '',
        quoted_amount: total,
        total_amount: total,
        hours_worked: 0,
        expenses: 0,
        created_by: createdBy,
        project_id: null,
        client: clientId
      };
      console.log('quoteToSend:', quoteToSend);
      const resQuote = await fetch("http://localhost:4000/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteToSend),
      });
      if (!resQuote.ok) throw new Error("Erreur lors de la création du devis");
      // Recharge la liste depuis la BDD
      await fetchQuotes();
      setShowCreateQuote(false);
      setNewQuote({ name: '', email: '', service_type: '', budget_range: '', timeline: '', description: '' });
      setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
      setSelectedUserId(null);
      setNewClient({ name: '', email: '' });
    } catch (e) {
      console.error('Erreur lors de la création du devis:', e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Gestion des devis et paiements</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={activeTab === 'quotes' ? fetchQuotes : fetchPaymentDashboard}>
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
             <Button variant="ghost" size="sm" onClick={() => {}}>
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="container mx-auto px-4 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Gestion des devis
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Paiements
            </TabsTrigger>
          </TabsList>

          {/* Tab Content: Quotes Management */}
          <TabsContent value="quotes" className="mt-6">

      {/* Menu création de devis */}
      {showCreateQuote && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleCreateQuote} className="bg-card p-8 rounded-2xl border border-border/50 w-full max-w-lg space-y-4">
            <h2 className="font-heading text-xl font-bold mb-4">Créer un devis</h2>
            {/* Sélection ou création de client */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Client</label>
              <select
                className="w-full border border-border px-3 py-2 rounded-lg bg-muted/30"
                value={selectedUserId ?? ''}
                onChange={e => setSelectedUserId(e.target.value === 'new' ? 'new' : Number(e.target.value))}
                required
              >
                <option value="" disabled>Choisir un client...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
                <option value="new">+ Nouveau client</option>
              </select>
              {selectedUserId === 'new' && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Nom du client"
                    value={newClient.name}
                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Email du client"
                    type="email"
                    value={newClient.email}
                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                    required
                  />
                </div>
              )}
            </div>
            <Input
              placeholder="Type de service"
              value={newQuote.service_type}
              onChange={e => setNewQuote({ ...newQuote, service_type: e.target.value })}
              required
            />
            <Input
              placeholder="Budget (ex: 1000-2000)"
              value={newQuote.budget_range}
              onChange={e => setNewQuote({ ...newQuote, budget_range: e.target.value })}
            />
            <Input
              placeholder="Délai (ex: 2 mois)"
              value={newQuote.timeline}
              onChange={e => setNewQuote({ ...newQuote, timeline: e.target.value })}
            />
            <Textarea
              placeholder="Description du projet"
              value={newQuote.description}
              onChange={e => setNewQuote({ ...newQuote, description: e.target.value })}
              required
              rows={3}
            />

            {/* Lignes/options du devis */}
            <div className="mt-6">
              <h3 className="font-heading text-lg font-semibold mb-2">Lignes du devis</h3>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={e => {
                        const newItems = [...items];
                        newItems[idx].description = e.target.value;
                        setItems(newItems);
                      }}
                      className="flex-1"
                      required
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={e => {
                        const newItems = [...items];
                        newItems[idx].quantity = parseInt(e.target.value) || 1;
                        setItems(newItems);
                      }}
                      className="w-16"
                      required
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Prix unit."
                      value={item.unitPrice}
                      onChange={e => {
                        const newItems = [...items];
                        newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setItems(newItems);
                      }}
                      className="w-24"
                      required
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => setItems(items.filter((_, i) => i !== idx))} disabled={items.length === 1}>-</Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])}>
                  + Ajouter une ligne
                </Button>
              </div>
              <div className="text-right mt-2 font-semibold">
                Total : {items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button type="submit" variant="hero" className="flex-1" disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer'}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateQuote(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

            {/* Dashboard Statistiques */}
            <div className="flex justify-end mb-4">
          <Button variant="hero" onClick={() => setShowCreateQuote(true)}>
            + Créer un devis
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
            <div className="text-2xl font-bold">{(totalRevenue / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <div className="text-muted-foreground mt-2">Chiffre d'affaires encaissé</div>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
            <div className="text-2xl font-bold">{totalExpenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <div className="text-muted-foreground mt-2">Dépenses</div>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
            <div className="text-2xl font-bold">{totalHours} h</div>
            <div className="text-muted-foreground mt-2">Heures travaillées</div>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
            <div className="text-2xl font-bold">{completedProjects} / {quotes.length}</div>
            <div className="text-muted-foreground mt-2">Projets terminés</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quote List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-heading text-lg font-semibold mb-4">Quote Requests ({quotes.length})</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : quotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No quote requests yet
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {quotes.map((quote) => (
                  <button
                    key={quote.id}
                    onClick={() => handleSelectQuote(quote)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedQuote?.id === quote.id
                        ? "border-primary bg-primary/5"
                        : "border-border/50 bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium truncate">{quote.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[quote.status] || statusColors.pending}`}>
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{quote.service_type}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(quote.created_at).toLocaleDateString()}
                      {quote.payment_status && (
                        <span className={`ml-auto px-2 py-0.5 rounded-full ${paymentColors[quote.payment_status]}`}>
                          {quote.payment_status}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quote Details */}
          <div className="lg:col-span-2">

            {selectedQuote ? (
              <div className="p-6 rounded-2xl bg-gradient-card border border-border/50">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-heading text-xl font-bold">{selectedQuote.name}</h2>
                    <p className="text-muted-foreground">{selectedQuote.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm px-3 py-1 rounded-full ${statusColors[selectedQuote.status]}`}>
                      {selectedQuote.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Service</p>
                    <p className="font-medium">{selectedQuote.service_type}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Budget</p>
                    <p className="font-medium">{selectedQuote.budget_range}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                    <p className="font-medium">{selectedQuote.timeline}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                    <p className={`font-medium ${selectedQuote.payment_status === "paid" ? "text-green-500" : ""}`}>
                      {selectedQuote.payment_status || "Unpaid"}
                      {selectedQuote.deposit_amount && selectedQuote.payment_status === "paid" && (
                        <span className="text-sm text-muted-foreground ml-2">
                          (${(selectedQuote.deposit_amount / 100).toFixed(2)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Tableau des lignes/options du devis */}
                {selectedQuote.items && selectedQuote.items.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground mb-2">Détail du devis</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border rounded-xl overflow-hidden">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-3 py-2 text-left">Description</th>
                            <th className="px-3 py-2 text-right">Qté</th>
                            <th className="px-3 py-2 text-right">Prix unitaire</th>
                            <th className="px-3 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedQuote.items.map((item: { description: string; quantity: number; unitPrice: number }, idx: number) => (
                            <tr key={idx} className="border-b">
                              <td className="px-3 py-2">{item.description}</td>
                              <td className="px-3 py-2 text-right">{item.quantity}</td>
                              <td className="px-3 py-2 text-right">{item.unitPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                              <td className="px-3 py-2 text-right">{(item.quantity * item.unitPrice).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold">
                            <td colSpan={3} className="px-3 py-2 text-right">Total</td>
                            <td className="px-3 py-2 text-right">
                              {selectedQuote.items.reduce((sum: number, item: { description: string; quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-xs text-muted-foreground mb-2">Project Description</p>
                  <p className="text-sm leading-relaxed bg-muted/20 p-4 rounded-xl">{selectedQuote.description}</p>
                </div>

                <div className="border-t border-border/50 pt-6 space-y-4">
                  <h3 className="font-heading font-semibold">Admin Actions</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Quoted Amount ($)</label>
                      <Input
                        type="number"
                        value={quotedAmount}
                        onChange={(e) => setQuotedAmount(e.target.value)}
                        placeholder="5000"
                        className="bg-muted/50"
                        disabled={selectedQuote.payment_status === 'paid'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Status</label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="quoted">Quoted</SelectItem>
                          <SelectItem value="deposit_received">Deposit Received</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Admin Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Internal notes about this quote..."
                      rows={3}
                      className="bg-muted/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="hero"
                      onClick={handleSaveQuote}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSendPaymentRequest}
                      disabled={isSendingPayment || !quotedAmount}
                      className="flex-1"
                    >
                      {isSendingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                      Create Payment Link (30% Deposit)
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="w-full"
                  >
                    {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                    Télécharger le devis (PDF)
                  </Button>

                  {quotedAmount && (
                    <p className="text-sm text-muted-foreground text-center">
                      Deposit amount: ${(parseInt(quotedAmount) * 0.3).toFixed(2)} (30% of ${quotedAmount})
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 rounded-2xl border border-dashed border-border/50">
                <p className="text-muted-foreground">Select a quote to view details</p>
              </div>
            )}
          </div>
        </div>
          </TabsContent>

          {/* Tab Content: Payments Dashboard */}
          <TabsContent value="payments" className="mt-6">
            {paymentLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Chargement du dashboard...</p>
                </div>
              </div>
            ) : paymentError || !paymentData ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">Erreur de chargement</p>
                  <p className="text-muted-foreground mb-4">{paymentError}</p>
                  <Button onClick={fetchPaymentDashboard} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                      <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(paymentData.stats.revenue.total)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {paymentData.stats.payments.paid} devis payés
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
                        {formatCurrency(paymentData.stats.revenue.pending)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {paymentData.stats.payments.pending} devis en attente
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
                        {formatCurrency(paymentData.stats.revenue.unpaid)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {paymentData.stats.payments.unpaid} devis impayés
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total devis</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{paymentData.stats.total_quotes}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {paymentData.stats.quotes_by_status.accepted} acceptés
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
                      {paymentData.recentPayments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Aucun paiement pour le moment
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {paymentData.recentPayments.map((payment) => (
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
                        En attente de paiement ({paymentData.pendingPayments.length})
                      </CardTitle>
                      <CardDescription>Devis avec lien de paiement généré</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {paymentData.pendingPayments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Aucun paiement en attente
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {paymentData.pendingPayments.map((quote) => (
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
                      Devis impayés ({paymentData.unpaidQuotes.length})
                    </CardTitle>
                    <CardDescription>Devis créés mais sans lien de paiement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paymentData.unpaidQuotes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Tous les devis ont un lien de paiement
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paymentData.unpaidQuotes.map((quote) => (
                          <div key={quote.id} className="p-4 rounded-lg border border-border/50 bg-card">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium">{quote.client_name}</p>
                              <span className={`text-xs px-2 py-1 rounded-full border ${getPaymentStatusBadge(quote.payment_status)}`}>
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
                    {paymentData.topClients.length === 0 ? (
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
                            {paymentData.topClients.map((client, index) => (
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
                    {paymentData.monthlyStats.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Pas encore de données mensuelles
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {paymentData.monthlyStats.map((month) => (
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
                    <CardTitle>Tous les devis ({paymentData.allQuotes.length})</CardTitle>
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
                          {paymentData.allQuotes.map((quote) => (
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
                                <span className={`text-xs px-2 py-1 rounded-full border ${getPaymentStatusBadge(quote.payment_status)}`}>
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
