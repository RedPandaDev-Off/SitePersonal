import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, FileText, Home, Loader2 } from "lucide-react";

interface QuoteInfo {
  id: number;
  name: string;
  email: string;
  service_type: string;
  quoted_amount: number;
  total_amount: number;
  deposit_amount: number;
  payment_status: string;
  paid_at: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quote_id");
  const [quote, setQuote] = useState<QuoteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuoteInfo = async () => {
      if (!quoteId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:4000/api/payments/status/${quoteId}`);
        if (response.ok) {
          const data = await response.json();
          setQuote(data);
        } else {
          setError("Impossible de récupérer les informations du devis");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteInfo();
  }, [quoteId]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Icône de succès */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement réussi !
        </h1>
        <p className="text-gray-600 mb-6">
          Merci pour votre paiement. Votre transaction a été effectuée avec succès.
        </p>

        {/* Détails du devis */}
        {quote && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Détails de la transaction
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">N° de devis</span>
                <span className="font-medium">#{quote.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{quote.service_type || "Non spécifié"}</span>
              </div>
              {quote.total_amount && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant total du devis</span>
                  <span className="font-medium">{formatAmount(quote.total_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Acompte payé (30%)</span>
                <span className="font-medium text-emerald-600">
                  {quote.deposit_amount ? formatAmount(quote.deposit_amount) : "N/A"}
                </span>
              </div>
              {quote.total_amount && quote.deposit_amount && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Reste à payer</span>
                  <span className="font-medium text-orange-600">
                    {formatAmount(quote.total_amount - quote.deposit_amount)}
                  </span>
                </div>
              )}
              {quote.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Date de paiement</span>
                  <span className="font-medium">{formatDate(quote.paid_at)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Statut</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Acompte payé
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-yellow-800">
            {error}
          </div>
        )}

        {/* Message de confirmation */}
        <p className="text-sm text-gray-500 mb-6">
          Un email de confirmation vous sera envoyé à l'adresse associée à votre devis.
        </p>

        {/* Bouton retour */}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
