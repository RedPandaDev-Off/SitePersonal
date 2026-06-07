import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 9,
    color: "#666666",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  quoteNumber: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 120,
    color: "#6b7280",
    fontSize: 10,
  },
  value: {
    flex: 1,
    color: "#1f2937",
    fontSize: 10,
  },
  clientBox: {
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    padding: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 10,
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 10,
    backgroundColor: "#f9fafb",
  },
  colDescription: {
    flex: 3,
    fontSize: 10,
  },
  colQty: {
    width: 60,
    textAlign: "center",
    fontSize: 10,
  },
  colPrice: {
    width: 80,
    textAlign: "right",
    fontSize: 10,
  },
  colTotal: {
    width: 80,
    textAlign: "right",
    fontSize: 10,
  },
  totalsSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 5,
    width: 250,
  },
  totalLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 20,
    color: "#6b7280",
    fontSize: 11,
  },
  totalValue: {
    width: 100,
    textAlign: "right",
    fontSize: 11,
    color: "#1f2937",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 250,
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  grandTotalLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 20,
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  grandTotalValue: {
    width: 100,
    textAlign: "right",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  descriptionBox: {
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  descriptionText: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "4 8",
    borderRadius: 3,
    fontSize: 9,
    alignSelf: "flex-start",
  },
  statusPaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  validityNote: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 5,
    fontSize: 9,
    color: "#92400e",
  },
  termsSection: {
    marginTop: 20,
  },
  termsText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.4,
  },
});

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteData {
  id: string;
  client?: number | string;
  name: string;
  email: string;
  service_type: string;
  budget_range: string;
  timeline: string;
  description: string;
  status: string;
  payment_status: string | null;
  quoted_amount: number | null;
  created_at: string;
  items?: QuoteItem[];
}

interface QuotePDFProps {
  quote: QuoteData;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
}

const formatCurrency = (amount: number | null | undefined) => {
  const value = amount ?? 0;
  // Formatage manuel - utiliser un point comme séparateur de milliers
  // car react-pdf a des problèmes avec les espaces
  const fixed = value.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  // Utiliser un point pour les milliers (format européen alternatif)
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousands},${decPart} EUR`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Génère un numéro de devis au format professionnel français: D-CLIENTID-DDMMYYYY-XXX
const formatQuoteNumber = (id: string, createdAt: string, clientId?: number | string) => {
  const date = new Date(createdAt);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const paddedId = id.toString().padStart(3, "0");
  const clientPart = clientId ? clientId.toString().padStart(3, "0") : "000";
  return `D-${clientPart}-${day}${month}${year}-${paddedId}`;
};

const QuotePDF = ({
  quote,
  companyName = "RedPandaDev",
  companyAddress = "1 Place Des Glasxiemes de Glasxième, 17170 Courçon",
  companyEmail = "redpandadev.contact@gmail.com",
  companyPhone = "+33 07 50 12 31 62",
}: QuotePDFProps) => {
  // Calculer les totaux
  const items = quote.items || [];
  const itemsTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Micro-entrepreneur : pas de TVA, prix = prix final
  const totalTTC = quote.quoted_amount || itemsTotal;
  const deposit = totalTTC * 0.3; // Acompte 30%

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>{companyName}</Text>
            <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 5 }}>
              Solutions Web Professionnelles
            </Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>{companyAddress}</Text>
            <Text>{companyEmail}</Text>
            <Text>{companyPhone}</Text>
          </View>
        </View>

        {/* Title and Quote Number */}
        <Text style={styles.title}>DEVIS</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <Text style={styles.quoteNumber}>N° {formatQuoteNumber(quote.id, quote.created_at, quote.client)}</Text>
          <View
            style={[
              styles.statusBadge,
              quote.payment_status === "paid" ? styles.statusPaid : {},
              { marginLeft: 10 },
            ]}
          >
            <Text>
              {quote.payment_status === "paid"
                ? "PAYÉ"
                : quote.status === "pending"
                ? "EN ATTENTE"
                : quote.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Client</Text>
          <View style={styles.clientBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Nom :</Text>
              <Text style={styles.value}>{quote.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email :</Text>
              <Text style={styles.value}>{quote.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date du devis :</Text>
              <Text style={styles.value}>{formatDate(quote.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* Project Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du Projet</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Type de service :</Text>
            <Text style={styles.value}>{quote.service_type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Montant du devis :</Text>
            <Text style={styles.value}>{formatCurrency(totalTTC)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Délai souhaité :</Text>
            <Text style={styles.value}>{quote.timeline}</Text>
          </View>
        </View>

        {/* Items Table */}
        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prestations</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colDescription]}>
                  Description
                </Text>
                <Text style={[styles.tableHeaderText, styles.colQty]}>Qté</Text>
                <Text style={[styles.tableHeaderText, styles.colPrice]}>
                  Prix Unit.
                </Text>
                <Text style={[styles.tableHeaderText, styles.colTotal]}>
                  Total
                </Text>
              </View>

              {/* Table Rows */}
              {items.map((item, index) => (
                <View
                  key={index}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={styles.colDescription}>{item.description}</Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colPrice}>
                    {formatCurrency(item.unitPrice)}
                  </Text>
                  <Text style={styles.colTotal}>
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={styles.totalsSection}>
              <View style={styles.grandTotal}>
                <Text style={styles.grandTotalLabel}>Total :</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(totalTTC)}</Text>
              </View>
              <View style={[styles.totalRow, { marginTop: 10 }]}>
                <Text style={styles.totalLabel}>Acompte (30%) :</Text>
                <Text style={[styles.totalValue, { color: "#3b82f6", fontWeight: "bold" }]}>
                  {formatCurrency(deposit)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        {quote.description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.sectionTitle}>Description du Projet</Text>
            <Text style={styles.descriptionText}>{quote.description}</Text>
          </View>
        )}

        {/* Validity Note */}
        <View style={styles.validityNote}>
          <Text>
            Ce devis est valable 30 jours à compter de sa date d'émission. Un
            acompte de 30% est demandé à la signature pour démarrer le projet.
          </Text>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>Conditions</Text>
          <Text style={styles.termsText}>
            • Paiement par virement bancaire ou carte bancaire{"\n"}
            • Acompte de 30% à la commande{"\n"}
            • Solde à la livraison du projet{"\n"}
            • Délai de paiement : 30 jours
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {companyName} - SIRET: 98930587500019 - TVA non applicable, art. 293 B du CGI
          </Text>
          <Text style={{ marginTop: 3 }}>
            Devis généré le {formatDate(new Date().toISOString())}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotePDF;
