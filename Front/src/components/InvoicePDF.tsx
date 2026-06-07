import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
    borderBottomColor: "#10b981",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
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
  invoiceNumber: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 20,
  },
  paidBadge: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "4 8",
    borderRadius: 3,
    fontSize: 9,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 140,
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
    backgroundColor: "#10b981",
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
  colDescription: { flex: 3, fontSize: 10 },
  colQty: { width: 60, textAlign: "center", fontSize: 10 },
  colPrice: { width: 80, textAlign: "right", fontSize: 10 },
  colTotal: { width: 80, textAlign: "right", fontSize: 10 },
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
    backgroundColor: "#10b981",
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
  paymentBox: {
    backgroundColor: "#ecfdf5",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  tvaNotice: {
    marginTop: 15,
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    fontSize: 8,
    color: "#6b7280",
    fontStyle: "italic",
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
});

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  generatedAt: string;
  quoteId: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  description?: string;
  totalAmount: number;
  depositAmount?: number;
  depositPaidAt?: string | null;
  balancePaidAt?: string | null;
  paidAt?: string | null;
  paymentStatus: string;
  items?: QuoteItem[];
}

const formatCurrency = (amount: number | null | undefined) => {
  const value = amount ?? 0;
  const fixed = value.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousands},${decPart} EUR`;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const InvoicePDF = ({ invoice }: { invoice: InvoiceData }) => {
  const items = invoice.items || [];
  const itemsTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = invoice.totalAmount || itemsTotal;
  const deposit = invoice.depositAmount || total * 0.3;
  const balance = total - deposit;
  const isFullyPaid = invoice.paymentStatus === "paid";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>RedPandaDev</Text>
            <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 5 }}>
              Solutions Web Professionnelles
            </Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>Adrien Beluriée</Text>
            <Text>1 Place Des Glasxiemes de Glasxième, 17170 Courçon</Text>
            <Text>redpandadev.contact@gmail.com</Text>
            <Text>SIRET : 98930587500019</Text>
          </View>
        </View>

        {/* Titre + Numéro */}
        <Text style={styles.title}>FACTURE</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
          <View style={styles.paidBadge}>
            <Text>{isFullyPaid ? "SOLDÉE" : "ACOMPTE REÇU"}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Date de facturation :</Text>
            <Text style={styles.value}>{formatDate(invoice.generatedAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Référence devis :</Text>
            <Text style={styles.value}>#{invoice.quoteId}</Text>
          </View>
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.clientBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Nom :</Text>
              <Text style={styles.value}>{invoice.clientName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email :</Text>
              <Text style={styles.value}>{invoice.clientEmail}</Text>
            </View>
          </View>
        </View>

        {/* Prestations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prestations</Text>
          {items.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
                <Text style={[styles.tableHeaderText, styles.colQty]}>Qté</Text>
                <Text style={[styles.tableHeaderText, styles.colPrice]}>Prix Unit.</Text>
                <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
              </View>
              {items.map((item, index) => (
                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={styles.colDescription}>{item.description}</Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
                  <Text style={styles.colTotal}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.clientBox}>
              <View style={styles.row}>
                <Text style={styles.label}>Type de service :</Text>
                <Text style={styles.value}>{invoice.serviceType}</Text>
              </View>
              {invoice.description && (
                <View style={styles.row}>
                  <Text style={styles.label}>Description :</Text>
                  <Text style={styles.value}>{invoice.description}</Text>
                </View>
              )}
            </View>
          )}

          {/* Totaux */}
          <View style={styles.totalsSection}>
            {!isFullyPaid && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Acompte versé (30%) :</Text>
                  <Text style={styles.totalValue}>{formatCurrency(deposit)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Solde restant (70%) :</Text>
                  <Text style={styles.totalValue}>{formatCurrency(balance)}</Text>
                </View>
              </>
            )}
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>
                {isFullyPaid ? "Total payé :" : "Montant total :"}
              </Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Récap paiements */}
        <View style={styles.paymentBox}>
          <Text style={[styles.sectionTitle, { color: "#065f46", marginBottom: 8 }]}>
            Récapitulatif des paiements
          </Text>
          {invoice.depositPaidAt && (
            <View style={styles.row}>
              <Text style={styles.label}>Acompte (30%) reçu le :</Text>
              <Text style={styles.value}>{formatDate(invoice.depositPaidAt)} — {formatCurrency(deposit)}</Text>
            </View>
          )}
          {invoice.balancePaidAt && (
            <View style={styles.row}>
              <Text style={styles.label}>Solde (70%) reçu le :</Text>
              <Text style={styles.value}>{formatDate(invoice.balancePaidAt)} — {formatCurrency(balance)}</Text>
            </View>
          )}
        </View>

        {/* Mention TVA micro-entrepreneur */}
        <View style={styles.tvaNotice}>
          <Text>TVA non applicable, art. 293 B du CGI</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            RedPandaDev — Adrien Beluriée — SIRET : 98930587500019
          </Text>
          <Text style={{ marginTop: 3 }}>
            TVA non applicable, art. 293 B du CGI — Facture générée le {formatDate(new Date().toISOString())}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
