const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

/**
 * ========================================
 * ROUTES PAYMENT LINKS (RECOMMANDÉ)
 * ========================================
 */

// Créer un Payment Link permanent pour un devis
router.post('/create-payment-link', paymentController.createPaymentLink);

// Désactiver un Payment Link
router.delete('/payment-link/:quoteId', paymentController.deactivatePaymentLink);

/**
 * ========================================
 * ROUTES CHECKOUT SESSION (Alternative)
 * ========================================
 */

// Créer une session de paiement Stripe Checkout (expire après 24h)
router.post('/create-checkout-session', paymentController.createCheckoutSession);

/**
 * ========================================
 * ROUTES DE VÉRIFICATION
 * ========================================
 */

// Vérifier le statut d'un paiement d'un devis
router.get('/status/:quoteId', paymentController.getPaymentStatus);

// Récupérer l'historique des paiements d'un utilisateur
router.get('/history/user/:userId', paymentController.getPaymentHistory);

/**
 * ========================================
 * ROUTES ADMIN
 * ========================================
 */

// Dashboard admin complet avec toutes les statistiques
router.get('/admin/dashboard', paymentController.getAdminDashboard);

// Récupérer tous les paiements (filtrable)
router.get('/all', paymentController.getAllPayments);

// Récupérer les détails d'un paiement depuis Stripe (optionnel)
router.get('/stripe-details/:quoteId', paymentController.getStripePaymentDetails);

/**
 * ========================================
 * WEBHOOK
 * ========================================
 * Note: Le webhook est défini directement dans server.js
 * car il nécessite express.raw() pour la vérification
 * de la signature Stripe
 */

module.exports = router;
