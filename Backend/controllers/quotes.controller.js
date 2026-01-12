const pool = require('../db');
const bcrypt = require('bcrypt');

async function getAllQuotes(req, res) {
  try {
    const result = await pool.query('SELECT * FROM quotes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des devis' });
  }
}

/*retrouver tout les devis par client ID*/
async function getQuotesByUserId(req, res) {
    const { userId } = req.params;
    try {
      const result =
        await pool.query('SELECT * FROM quotes WHERE client = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors de la récupération des devis par utilisateur' });
    }
    }

    /*retrouver tout les devis par status */
    async function getQuotesByStatus(req, res) {
        const { status } = req.params;
        try {
          const result =
            await pool.query('SELECT * FROM quotes WHERE status = $1', [status]);
            res.json(result.rows);
        } catch (err) {
          res.status(500).json({ error: 'Erreur lors de la récupération des devis par statut' });
        }
        }

        /*retrouver tout les devis par payment status */
        async function getQuotesByPaymentStatus(req, res) {
            const { paymentStatus } = req.params;
            try {
                const result =
                await pool.query('SELECT * FROM quotes WHERE payment_status = $1', [paymentStatus]);
                res.json(result.rows);
            } catch (err) {
                res.status(500).json({ error: 'Erreur lors de la récupération des devis par statut de paiement' });
            }
            }

            /*rtrouver tout les devis par date range*/
            async function getQuotesByDateRange(req, res) {
                const { startDate, endDate } = req.params;
                try {
                    const result =
                    await pool.query('SELECT * FROM quotes WHERE date_created BETWEEN $1 AND $2', [startDate, endDate]);
                    res.json(result.rows);
                } catch (err) {
                    res.status(500).json({ error: 'Erreur lors de la récupération des devis par plage de dates' });
                }
                }

                
                async function updateQuoteById(req, res) {
                    const { id } = req.params;
                    const { name, service_type, budget_range, timeline, description, status, payment_status, deposit, amount, quoted_amount, total_amount, expense } = req.body;
                    try {
                        const result = await pool.query(
                            'UPDATE quotes SET name = $1, service_type = $2, budget_range = $3, timeline = $4, description = $5, status = $6, payment_status = $7, deposit = $8, amount = $9, quoted_amount = $10, total_amount = $11, expense = $12 WHERE id = $13 RETURNING *',
                            [name, service_type, budget_range, timeline, description, status, payment_status, deposit, amount, quoted_amount, total_amount, expense, id]
                        );
                    } catch (err) {
                        res.status(500).json({ error: 'Erreur lors de la mise à jour du devis' });
                    }
                }
                /*retrouver devis par project id*/
                async function getQuotesByProjectId(req, res) {
                    const { projectId } = req.params;
                    try {
                        const result =
                            await pool.query('SELECT * FROM quotes WHERE project_id = $1', [projectId]);
                        res.json(result.rows);
                    } catch (err) {
                        res.status(500).json({ error: 'Erreur lors de la récupération des devis par ID de projet' });
                    }
                }


module.exports = {
    getAllQuotes,
    getQuotesByUserId,
    getQuotesByStatus,
    getQuotesByPaymentStatus,
    updateQuoteById,
    getQuotesByDateRange,
    getQuotesByProjectId
};