const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../db');

/**
 * ========================================
 * PAYMENT LINKS (RECOMMANDÉ)
 * Créer un lien de paiement permanent
 * ========================================
 */
const createPaymentLink = async (req, res) => {
  try {
    const { quoteId } = req.body;

    if (!quoteId) {
      return res.status(400).json({ error: 'Le quoteId est requis' });
    }

    // Récupérer les informations du devis
    const quoteQuery = await pool.query(
      `SELECT q.*, u.email, u.name as user_name, p.name as project_name
       FROM quotes q
       LEFT JOIN users u ON q.client = u.id
       LEFT JOIN projects p ON q.project_id = p.id
       WHERE q.id = $1`,
      [quoteId]
    );

    if (quoteQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    const quote = quoteQuery.rows[0];

    // Vérifier que le devis n'est pas déjà payé
    if (quote.payment_status === 'paid') {
      return res.status(400).json({
        error: 'Ce devis a déjà été payé',
        paymentLink: quote.stripe_payment_link
      });
    }

    // Vérifier que le montant total existe
    if (!quote.total_amount || quote.total_amount <= 0) {
      return res.status(400).json({ error: 'Le montant du devis est invalide' });
    }

    // Calculer l'acompte (30% du montant total)
    const depositPercentage = 0.30;
    const depositAmount = quote.deposit_amount && quote.deposit_amount > 0
      ? parseFloat(quote.deposit_amount)
      : parseFloat(quote.total_amount) * depositPercentage;

    // Si un lien existe déjà, le retourner
    if (quote.stripe_payment_link) {
      return res.json({
        url: quote.stripe_payment_link,
        message: 'Lien de paiement existant récupéré',
        alreadyExists: true
      });
    }

    // Créer un produit Stripe pour ce devis
    const product = await stripe.products.create({
      name: `Acompte Devis #${quote.id}${quote.project_name ? ' - ' + quote.project_name : ''}`,
      description: `Acompte de 30% - ${quote.description || quote.service_type || 'Service professionnel'}`,
      metadata: {
        quoteId: quoteId.toString(),
        userId: quote.client?.toString() || '',
        projectId: quote.project_id?.toString() || '',
        isDeposit: 'true',
        depositPercentage: '30',
      },
    });

    // Créer un prix pour ce produit (acompte 30%)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(depositAmount * 100), // Montant de l'acompte en centimes
      currency: 'eur',
    });

    // Créer le Payment Link permanent
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.CLIENT_URL}/payment/success?quote_id=${quoteId}&type=deposit`,
        },
      },
      metadata: {
        quoteId: quoteId.toString(),
        userId: quote.client?.toString() || '',
        projectId: quote.project_id?.toString() || '',
        paymentType: 'deposit',
      },
    });

    // Mettre à jour le devis avec le lien de paiement et le montant de l'acompte
    await pool.query(
      `UPDATE quotes
       SET payment_status = $1, stripe_payment_link = $2, deposit_amount = $3, updated_at = NOW()
       WHERE id = $4`,
      ['pending', paymentLink.url, depositAmount, quoteId]
    );

  

    res.json({
      paymentLinkId: paymentLink.id,
      url: paymentLink.url,
      message: 'Lien de paiement permanent créé avec succès',
      quoteId: quoteId,
      totalAmount: quote.total_amount,
      depositAmount: depositAmount,
      depositPercentage: 30
    });

  } catch (error) {
    console.error('Erreur lors de la création du Payment Link:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du lien de paiement',
      details: error.message
    });
  }
};

/**
 * ========================================
 * CHECKOUT SESSION (Alternative)
 * Session temporaire qui expire après 24h
 * ========================================
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { quoteId } = req.body;

    if (!quoteId) {
      return res.status(400).json({ error: 'Le quoteId est requis' });
    }

    // Récupérer les informations du devis
    const quoteQuery = await pool.query(
      `SELECT q.*, u.email, u.name as user_name, p.name as project_name
       FROM quotes q
       LEFT JOIN users u ON q.client = u.id
       LEFT JOIN projects p ON q.project_id = p.id
       WHERE q.id = $1`,
      [quoteId]
    );

    if (quoteQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    const quote = quoteQuery.rows[0];

    // Vérifier que le devis n'est pas déjà payé
    if (quote.payment_status === 'paid') {
      return res.status(400).json({ error: 'Ce devis a déjà été payé' });
    }

    // Vérifier que le montant total existe
    if (!quote.total_amount || quote.total_amount <= 0) {
      return res.status(400).json({ error: 'Le montant du devis est invalide' });
    }

    // Calculer l'acompte (30% du montant total)
    const depositPercentage = 0.30;
    const depositAmount = quote.deposit_amount && quote.deposit_amount > 0
      ? parseFloat(quote.deposit_amount)
      : parseFloat(quote.total_amount) * depositPercentage;

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Acompte Devis #${quote.id}${quote.project_name ? ' - ' + quote.project_name : ''}`,
              description: `Acompte de 30% - ${quote.description || quote.service_type || 'Service professionnel'}`,
            },
            unit_amount: Math.round(depositAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&quote_id=${quoteId}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel?quote_id=${quoteId}`,
      customer_email: quote.email,
      metadata: {
        quoteId: quoteId.toString(),
        userId: quote.client?.toString() || '',
        projectId: quote.project_id?.toString() || '',
      },
    });

    // Mettre à jour le devis avec l'ID de session et le montant de l'acompte
    await pool.query(
      `UPDATE quotes
       SET payment_status = $1, stripe_session_id = $2, deposit_amount = $3, updated_at = NOW()
       WHERE id = $4`,
      ['pending', session.id, depositAmount, quoteId]
    );



    res.json({
      sessionId: session.id,
      url: session.url,
      message: 'Session de paiement créée avec succès (expire dans 24h)',
      quoteId: quoteId,
      totalAmount: quote.total_amount,
      depositAmount: depositAmount,
      depositPercentage: 30
    });

  } catch (error) {
    console.error('Erreur lors de la création de la session Checkout:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la session de paiement',
      details: error.message
    });
  }
};

/**
 * ========================================
 * WEBHOOK STRIPE
 * Gestion des événements de paiement
 * ========================================
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Erreur de vérification du webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }



  // Gérer les différents types d'événements Stripe
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`ℹ️  Événement non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Gérer la complétion d'une session Checkout
const handleCheckoutSessionCompleted = async (session) => {
  try {
    const quoteId = session.metadata.quoteId;
    const paymentType = session.metadata.paymentType || 'deposit'; // deposit ou balance

    if (!quoteId) {
      console.error('❌ Pas de quoteId dans les metadata de la session');
      return;
    }

    // Récupérer le devis actuel
    const quoteResult = await pool.query('SELECT * FROM quotes WHERE id = $1', [quoteId]);
    if (quoteResult.rows.length === 0) {
      console.error(`❌ Devis #${quoteId} non trouvé`);
      return;
    }

    const quote = quoteResult.rows[0];
    let result;

    if (paymentType === 'balance') {
      // Paiement du SOLDE (70%)
      result = await pool.query(
        `UPDATE quotes
         SET payment_status = $1,
             balance_paid = TRUE,
             balance_paid_at = NOW(),
             stripe_payment_intent_id = $2,
             paid_at = NOW(),
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        ['paid', session.payment_intent, quoteId]
      );
    
    } else {
      // Paiement de l'ACOMPTE (30%)
      result = await pool.query(
        `UPDATE quotes
         SET payment_status = $1,
             deposit_paid = TRUE,
             deposit_paid_at = NOW(),
             stripe_payment_intent_id = $2,
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        ['deposit_paid', session.payment_intent, quoteId]
      );
     
    }

    if (result.rows.length === 0) {
      console.error(`❌ Devis #${quoteId} non trouvé`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la gestion du checkout session:', error);
  }
};

// Gérer un Payment Intent réussi
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const quoteId = paymentIntent.metadata.quoteId;
    const paymentType = paymentIntent.metadata.paymentType || 'deposit';

    if (!quoteId) {
      console.error('❌ Pas de quoteId dans les metadata du payment intent');
      return;
    }

    // Récupérer le devis actuel
    const quoteResult = await pool.query('SELECT * FROM quotes WHERE id = $1', [quoteId]);
    if (quoteResult.rows.length === 0) {
      console.error(`❌ Devis #${quoteId} non trouvé`);
      return;
    }

    const quote = quoteResult.rows[0];
    let result;

    if (paymentType === 'balance') {
      // Paiement du SOLDE (70%)
      result = await pool.query(
        `UPDATE quotes
         SET payment_status = $1,
             balance_paid = TRUE,
             balance_paid_at = NOW(),
             stripe_payment_intent_id = $2,
             paid_at = NOW(),
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        ['paid', paymentIntent.id, quoteId]
      );

    } else {
      // Paiement de l'ACOMPTE (30%)
      result = await pool.query(
        `UPDATE quotes
         SET payment_status = $1,
             deposit_paid = TRUE,
             deposit_paid_at = NOW(),
             stripe_payment_intent_id = $2,
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        ['deposit_paid', paymentIntent.id, quoteId]
      );

    }

    if (result.rows.length === 0) {
      console.error(`❌ Devis #${quoteId} non trouvé`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la gestion du Payment Intent:', error);
  }
};

// Gérer un paiement échoué
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const quoteId = paymentIntent.metadata.quoteId;

    if (!quoteId) {
      console.error('❌ Pas de quoteId dans les metadata');
      return;
    }

    // Mettre à jour le devis
    const result = await pool.query(
      `UPDATE quotes
       SET payment_status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      ['failed', quoteId]
    );

    if (result.rows.length > 0) {
      
    } else {
      console.error(`❌ Devis #${quoteId} non trouvé`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la gestion du paiement échoué:', error);
  }
};

/**
 * ========================================
 * VÉRIFICATION DU STATUT
 * ========================================
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const result = await pool.query(
      `SELECT
        q.id,
        q.payment_status,
        q.total_amount,
        q.deposit_amount,
        q.deposit_paid,
        q.deposit_paid_at,
        q.balance_amount,
        q.balance_paid,
        q.balance_paid_at,
        q.service_type,
        q.stripe_session_id,
        q.stripe_payment_intent_id,
        q.stripe_payment_link,
        q.stripe_balance_payment_link,
        q.paid_at,
        q.status,
        q.created_at,
        q.updated_at,
        u.name as client_name,
        u.email as client_email,
        p.name as project_name
       FROM quotes q
       LEFT JOIN users u ON q.client = u.id
       LEFT JOIN projects p ON q.project_id = p.id
       WHERE q.id = $1`,
      [quoteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * ========================================
 * HISTORIQUE DES PAIEMENTS
 * ========================================
 */
const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT
        q.id,
        q.payment_status,
        q.total_amount,
        q.paid_at,
        q.created_at,
        q.service_type,
        q.description,
        p.name as project_name,
        u.name as client_name
       FROM quotes q
       LEFT JOIN projects p ON q.project_id = p.id
       LEFT JOIN users u ON q.client = u.id
       WHERE q.client = $1 AND q.payment_status = 'paid'
       ORDER BY q.paid_at DESC`,
      [userId]
    );

    res.json({
      total: result.rows.length,
      payments: result.rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * ========================================
 * DASHBOARD ADMIN COMPLET
 * ========================================
 */
const getAdminDashboard = async (req, res) => {
  try {
    // 1. Récupérer tous les devis
    const allQuotesQuery = await pool.query(`
      SELECT
        q.id,
        q.payment_status,
        q.total_amount,
        q.paid_at,
        q.created_at,
        q.updated_at,
        q.service_type,
        q.description,
        q.status,
        q.stripe_payment_link,
        p.name as project_name,
        u.name as client_name,
        u.email as client_email
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN users u ON q.client = u.id
      ORDER BY q.created_at DESC
    `);

    const allQuotes = allQuotesQuery.rows;

    // 2. Calculer les statistiques globales
    const stats = {
      // Statistiques de devis
      total_quotes: allQuotes.length,
      quotes_by_status: {
        pending: allQuotes.filter(q => q.status === 'pending').length,
        accepted: allQuotes.filter(q => q.status === 'accepted').length,
        rejected: allQuotes.filter(q => q.status === 'rejected').length,
      },

      // Statistiques de paiement
      payments: {
        unpaid: allQuotes.filter(q => q.payment_status === 'unpaid').length,
        pending: allQuotes.filter(q => q.payment_status === 'pending').length,
        paid: allQuotes.filter(q => q.payment_status === 'paid').length,
        failed: allQuotes.filter(q => q.payment_status === 'failed').length,
        cancelled: allQuotes.filter(q => q.payment_status === 'cancelled').length,
      },

      // Revenus
      revenue: {
        total: allQuotes
          .filter(q => q.payment_status === 'paid')
          .reduce((sum, q) => sum + parseFloat(q.total_amount || 0), 0),
        pending: allQuotes
          .filter(q => q.payment_status === 'pending')
          .reduce((sum, q) => sum + parseFloat(q.total_amount || 0), 0),
        unpaid: allQuotes
          .filter(q => q.payment_status === 'unpaid')
          .reduce((sum, q) => sum + parseFloat(q.total_amount || 0), 0),
      }
    };

    // 3. Derniers paiements (5 derniers)
    const recentPayments = allQuotes
      .filter(q => q.payment_status === 'paid')
      .slice(0, 5);

    // 4. Devis en attente de paiement
    const pendingPayments = allQuotes.filter(q => q.payment_status === 'pending');

    // 5. Devis impayés
    const unpaidQuotes = allQuotes.filter(q => q.payment_status === 'unpaid');

    // 6. Statistiques par mois (derniers 6 mois)
    const monthlyStats = await pool.query(`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as total_quotes,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_quotes,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as revenue
      FROM quotes
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
    `);

    // 7. Top clients (par nombre de devis payés)
    const topClients = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(q.id) as total_quotes,
        COUNT(CASE WHEN q.payment_status = 'paid' THEN 1 END) as paid_quotes,
        SUM(CASE WHEN q.payment_status = 'paid' THEN q.total_amount ELSE 0 END) as total_revenue
      FROM users u
      LEFT JOIN quotes q ON u.id = q.client
      GROUP BY u.id, u.name, u.email
      HAVING COUNT(q.id) > 0
      ORDER BY total_revenue DESC
      LIMIT 10
    `);

    res.json({
      stats,
      recentPayments,
      pendingPayments,
      unpaidQuotes,
      monthlyStats: monthlyStats.rows,
      topClients: topClients.rows,
      allQuotes: allQuotes
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

/**
 * ========================================
 * RÉCUPÉRER TOUS LES PAIEMENTS (ADMIN)
 * ========================================
 */
const getAllPayments = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT
        q.id,
        q.payment_status,
        q.total_amount,
        q.paid_at,
        q.created_at,
        q.service_type,
        q.description,
        q.stripe_payment_link,
        p.name as project_name,
        u.name as client_name,
        u.email as client_email
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN users u ON q.client = u.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE q.payment_status = $1';
      params.push(status);
    }

    query += ' ORDER BY q.created_at DESC';

    const result = await pool.query(query, params);

    // Calculer les statistiques
    const stats = {
      total_quotes: result.rows.length,
      total_paid: result.rows.filter(q => q.payment_status === 'paid').length,
      total_pending: result.rows.filter(q => q.payment_status === 'pending').length,
      total_unpaid: result.rows.filter(q => q.payment_status === 'unpaid').length,
      total_failed: result.rows.filter(q => q.payment_status === 'failed').length,
      total_revenue: result.rows
        .filter(q => q.payment_status === 'paid')
        .reduce((sum, q) => sum + parseFloat(q.total_amount), 0)
    };

    res.json({
      stats,
      quotes: result.rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * ========================================
 * DÉTAILS STRIPE (OPTIONNEL)
 * ========================================
 */
const getStripePaymentDetails = async (req, res) => {
  try {
    const { quoteId } = req.params;

    // Récupérer le devis
    const quoteResult = await pool.query(
      'SELECT stripe_payment_intent_id, stripe_session_id FROM quotes WHERE id = $1',
      [quoteId]
    );

    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    const { stripe_payment_intent_id, stripe_session_id } = quoteResult.rows[0];

    if (!stripe_payment_intent_id && !stripe_session_id) {
      return res.status(404).json({ error: 'Aucun paiement Stripe associé à ce devis' });
    }

    let stripeData = {};

    // Récupérer les détails du Payment Intent si disponible
    if (stripe_payment_intent_id) {
      const paymentIntent = await stripe.paymentIntents.retrieve(stripe_payment_intent_id);
      stripeData.paymentIntent = {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: new Date(paymentIntent.created * 1000),
        payment_method: paymentIntent.payment_method,
      };
    }

    // Récupérer les détails de la session si disponible
    if (stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(stripe_session_id);
      stripeData.session = {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total / 100,
        currency: session.currency,
        customer_email: session.customer_email,
      };
    }

    res.json(stripeData);

  } catch (error) {
    console.error('Erreur lors de la récupération des détails Stripe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * ========================================
 * PAIEMENT DU SOLDE (70%)
 * Créer un lien de paiement pour le reste
 * ========================================
 */
const createBalancePaymentLink = async (req, res) => {
  try {
    const { quoteId } = req.body;

    if (!quoteId) {
      return res.status(400).json({ error: 'Le quoteId est requis' });
    }

    // Récupérer les informations du devis
    const quoteQuery = await pool.query(
      `SELECT q.*, u.email, u.name as user_name, p.name as project_name
       FROM quotes q
       LEFT JOIN users u ON q.client = u.id
       LEFT JOIN projects p ON q.project_id = p.id
       WHERE q.id = $1`,
      [quoteId]
    );

    if (quoteQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    const quote = quoteQuery.rows[0];

    // Vérifier que l'acompte a été payé
    if (!quote.deposit_paid && quote.payment_status !== 'deposit_paid') {
      return res.status(400).json({
        error: 'L\'acompte doit être payé avant de demander le solde',
        depositPaid: false
      });
    }

    // Vérifier que le solde n'est pas déjà payé
    if (quote.balance_paid || quote.payment_status === 'paid') {
      return res.status(400).json({
        error: 'Le solde a déjà été payé',
        balancePaid: true
      });
    }

    // Calculer le montant du solde (70% ou le reste)
    const totalAmount = parseFloat(quote.total_amount);
    const depositAmount = parseFloat(quote.deposit_amount) || totalAmount * 0.30;
    const balanceAmount = totalAmount - depositAmount;

    if (balanceAmount <= 0) {
      return res.status(400).json({ error: 'Le montant du solde est invalide' });
    }

    // Si un lien de solde existe déjà, le retourner
    if (quote.stripe_balance_payment_link) {
      return res.json({
        url: quote.stripe_balance_payment_link,
        message: 'Lien de paiement du solde existant récupéré',
        alreadyExists: true
      });
    }

    // Créer un produit Stripe pour le solde
    const product = await stripe.products.create({
      name: `Solde Devis #${quote.id}${quote.project_name ? ' - ' + quote.project_name : ''}`,
      description: `Solde de 70% - ${quote.description || quote.service_type || 'Service professionnel'}`,
      metadata: {
        quoteId: quoteId.toString(),
        userId: quote.client?.toString() || '',
        projectId: quote.project_id?.toString() || '',
        isBalance: 'true',
        balancePercentage: '70',
      },
    });

    // Créer un prix pour le solde
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(balanceAmount * 100),
      currency: 'eur',
    });

    // Créer le Payment Link pour le solde
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.CLIENT_URL}/payment/success?quote_id=${quoteId}&type=balance`,
        },
      },
      metadata: {
        quoteId: quoteId.toString(),
        userId: quote.client?.toString() || '',
        projectId: quote.project_id?.toString() || '',
        paymentType: 'balance',
      },
    });

    // Mettre à jour le devis avec le lien de paiement du solde
    await pool.query(
      `UPDATE quotes
       SET stripe_balance_payment_link = $1, balance_amount = $2, updated_at = NOW()
       WHERE id = $3`,
      [paymentLink.url, balanceAmount, quoteId]
    );

    

    res.json({
      paymentLinkId: paymentLink.id,
      url: paymentLink.url,
      message: 'Lien de paiement du solde créé avec succès',
      quoteId: quoteId,
      totalAmount: totalAmount,
      depositAmount: depositAmount,
      balanceAmount: balanceAmount,
      balancePercentage: 70
    });

  } catch (error) {
    console.error('Erreur lors de la création du Payment Link solde:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du lien de paiement du solde',
      details: error.message
    });
  }
};

/**
 * ========================================
 * ANNULER/DÉSACTIVER UN PAYMENT LINK
 * ========================================
 */
const deactivatePaymentLink = async (req, res) => {
  try {
    const { quoteId } = req.params;

    // Récupérer le devis
    const quoteResult = await pool.query(
      'SELECT stripe_payment_link, payment_status FROM quotes WHERE id = $1',
      [quoteId]
    );

    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    const { stripe_payment_link, payment_status } = quoteResult.rows[0];

    if (payment_status === 'paid') {
      return res.status(400).json({ error: 'Impossible de désactiver un devis déjà payé' });
    }

    if (!stripe_payment_link) {
      return res.status(400).json({ error: 'Aucun lien de paiement associé' });
    }

    // Extraire l'ID du payment link depuis l'URL
    const linkId = stripe_payment_link.split('/').pop();

    // Désactiver le Payment Link sur Stripe
    await stripe.paymentLinks.update(linkId, {
      active: false
    });

    // Mettre à jour le devis
    await pool.query(
      `UPDATE quotes
       SET payment_status = $1, updated_at = NOW()
       WHERE id = $2`,
      ['cancelled', quoteId]
    );



    res.json({
      message: 'Lien de paiement désactivé avec succès',
      quoteId: quoteId
    });

  } catch (error) {
    
    res.status(500).json({
      error: 'Erreur lors de la désactivation du lien de paiement',
      details: error.message
    });
  }
};

module.exports = {
  createPaymentLink,
  createBalancePaymentLink,
  createCheckoutSession,
  handleWebhook,
  getPaymentStatus,
  getPaymentHistory,
  getAdminDashboard,
  getAllPayments,
  getStripePaymentDetails,
  deactivatePaymentLink,
};
