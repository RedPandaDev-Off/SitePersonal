const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

/**
 * ========================================
 * ROUTES PAYMENT LINKS (Admin seulement)
 * ========================================
 */

// Créer un Payment Link permanent pour l'acompte (30%)
router.post('/create-payment-link', authenticateToken, requireAdmin, paymentController.createPaymentLink);

// Créer un Payment Link pour le solde (70%)
router.post('/create-balance-payment', authenticateToken, requireAdmin, paymentController.createBalancePaymentLink);

// Désactiver un Payment Link
router.delete('/payment-link/:quoteId', authenticateToken, requireAdmin, paymentController.deactivatePaymentLink);

/**
 * ========================================
 * ROUTES CHECKOUT SESSION (Admin seulement)
 * ========================================
 */

// Créer une session de paiement Stripe Checkout (expire après 24h)
router.post('/create-checkout-session', authenticateToken, requireAdmin, paymentController.createCheckoutSession);

/**
 * ========================================
 * ROUTES DE VÉRIFICATION
 * ========================================
 */

// Vérifier le statut d'un paiement d'un devis (authentifié)
router.get('/status/:quoteId', authenticateToken, paymentController.getPaymentStatus);

// Récupérer l'historique des paiements d'un utilisateur (admin)
router.get('/history/user/:userId', authenticateToken, requireAdmin, paymentController.getPaymentHistory);

/**
 * ========================================
 * ROUTES ADMIN
 * ========================================
 */

// Dashboard admin complet avec toutes les statistiques
router.get('/admin/dashboard', authenticateToken, requireAdmin, paymentController.getAdminDashboard);

// Récupérer tous les paiements (filtrable)
router.get('/all', authenticateToken, requireAdmin, paymentController.getAllPayments);

// Récupérer les détails d'un paiement depuis Stripe (optionnel)
router.get('/stripe-details/:quoteId', authenticateToken, requireAdmin, paymentController.getStripePaymentDetails);

/**
 * ========================================
 * WEBHOOK
 * ========================================
 * Note: Le webhook est défini directement dans server.js
 * car il nécessite express.raw() pour la vérification
 * de la signature Stripe
 */

module.exports = router;
