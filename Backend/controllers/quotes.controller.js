const pool = require('../db');

async function getAllQuotes(req, res) {
  try {
    const result = await pool.query('SELECT * FROM quotes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des devis' });
  }
}

/* Créer un nouveau devis */
async function createQuote(req, res) {
  const {
    name,
    email,
    service_type,
    budget_range,
    timeline,
    description,
    status,
    payment_status,
    deposit_amount,
    admin_notes,
    quoted_amount,
    total_amount,
    hours_worked,
    expenses,
    created_by,
    project_id,
    client
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO quotes (
        name, email, service_type, budget_range, timeline, description,
        status, payment_status, deposit_amount, admin_notes, quoted_amount,
        total_amount, hours_worked, expenses, created_by, project_id, client, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *`,
      [
        name, email, service_type, budget_range, timeline, description,
        status || 'pending', payment_status || 'unpaid', deposit_amount || 0,
        admin_notes || '', quoted_amount, total_amount, hours_worked || 0,
        expenses || 0, created_by, project_id, client
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la création du devis:', err);
    res.status(500).json({ error: 'Erreur lors de la création du devis', details: err.message });
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

                
                /* Récupérer un devis par ID */
async function getQuoteById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du devis' });
  }
}

/* Mettre à jour un devis par ID */
async function updateQuoteById(req, res) {
  const { id } = req.params;
  const {
    name,
    email,
    service_type,
    budget_range,
    timeline,
    description,
    status,
    payment_status,
    deposit_amount,
    admin_notes,
    quoted_amount,
    total_amount,
    hours_worked,
    expenses
  } = req.body;

  try {
    // Récupérer le devis actuel pour ne pas écraser les champs non fournis
    const currentQuote = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (currentQuote.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    const current = currentQuote.rows[0];

    const result = await pool.query(
      `UPDATE quotes SET
        name = $1,
        email = $2,
        service_type = $3,
        budget_range = $4,
        timeline = $5,
        description = $6,
        status = $7,
        payment_status = $8,
        deposit_amount = $9,
        admin_notes = $10,
        quoted_amount = $11,
        total_amount = $12,
        hours_worked = $13,
        expenses = $14
      WHERE id = $15
      RETURNING *`,
      [
        name ?? current.name,
        email ?? current.email,
        service_type ?? current.service_type,
        budget_range ?? current.budget_range,
        timeline ?? current.timeline,
        description ?? current.description,
        status ?? current.status,
        payment_status ?? current.payment_status,
        deposit_amount ?? current.deposit_amount,
        admin_notes ?? current.admin_notes,
        quoted_amount ?? current.quoted_amount,
        total_amount ?? current.total_amount,
        hours_worked ?? current.hours_worked,
        expenses ?? current.expenses,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du devis:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du devis' });
  }
}

/* Supprimer un devis par ID */
async function deleteQuoteById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM quotes WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    res.json({ message: 'Devis supprimé avec succès', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du devis' });
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
    createQuote,
    getQuoteById,
    getQuotesByUserId,
    getQuotesByStatus,
    getQuotesByPaymentStatus,
    updateQuoteById,
    deleteQuoteById,
    getQuotesByDateRange,
    getQuotesByProjectId
};