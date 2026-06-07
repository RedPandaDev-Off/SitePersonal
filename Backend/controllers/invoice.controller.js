const pool = require('../db');

/**
 * Récupère ou crée une facture pour un devis payé.
 * Garantit un numéro séquentiel unique au format F-YYYY-NNN.
 */
const getOrCreateInvoice = async (req, res) => {
  const { quoteId } = req.params;

  try {
    // Vérifier que le devis existe et est payé (acompte ou total)
    const quoteResult = await pool.query(
      `SELECT q.*, u.name as client_name, u.email as client_email
       FROM quotes q
       LEFT JOIN users u ON q.client = u.id
       WHERE q.id = $1`,
      [quoteId]
    );

    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    const quote = quoteResult.rows[0];

    if (!['deposit_paid', 'paid'].includes(quote.payment_status)) {
      return res.status(400).json({
        error: 'Une facture ne peut être générée que pour un devis avec au moins un acompte payé',
        payment_status: quote.payment_status
      });
    }

    // Vérifier si une facture existe déjà pour ce devis
    const existing = await pool.query(
      'SELECT * FROM invoices WHERE quote_id = $1',
      [quoteId]
    );

    if (existing.rows.length > 0) {
      return res.json({
        invoice: existing.rows[0],
        quote
      });
    }

    // Générer le numéro séquentiel F-YYYY-NNN
    const year = new Date().getFullYear();
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM invoices WHERE invoice_number LIKE $1`,
      [`F-${year}-%`]
    );
    const nextNum = (parseInt(countResult.rows[0].count) + 1).toString().padStart(3, '0');
    const invoiceNumber = `F-${year}-${nextNum}`;

    // Créer la facture
    const invoiceResult = await pool.query(
      `INSERT INTO invoices (invoice_number, quote_id, generated_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [invoiceNumber, quoteId, req.user.id]
    );

    res.json({
      invoice: invoiceResult.rows[0],
      quote
    });

  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

module.exports = { getOrCreateInvoice };
