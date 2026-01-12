import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

import {
  LogOut,
  RefreshCw,
  DollarSign,
  Clock,
  CheckCircle,
  
  
  Loader2,
  
} from "lucide-react";

interface Quote {
  id: string;
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

const Admin = () => {
  // Auth logic removed
  const [quotes, setQuotes] = useState<QuoteWithStats[]>([]);
  const [showCreateQuote, setShowCreateQuote] = useState(false);
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
            <p className="text-sm text-muted-foreground">Manage quote requests and payments</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchQuotes}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
             <Button variant="ghost" size="sm" onClick={() => {}}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

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
      <div className="container mx-auto px-4 py-8">
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
      </div>
    </div>
  );
};

export default Admin;
