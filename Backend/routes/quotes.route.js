const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quotes.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Route publique - création de devis (formulaire client)
router.post('/', quoteController.createQuote);

// Routes protégées (admin seulement)
router.get('/', authenticateToken, requireAdmin, quoteController.getAllQuotes);
router.get('/user/:userId', authenticateToken, requireAdmin, quoteController.getQuotesByUserId);
router.get('/status/:status', authenticateToken, requireAdmin, quoteController.getQuotesByStatus);
router.get('/payment-status/:paymentStatus', authenticateToken, requireAdmin, quoteController.getQuotesByPaymentStatus);
router.get('/date-range/:startDate/:endDate', authenticateToken, requireAdmin, quoteController.getQuotesByDateRange);
router.get('/project/:projectId', authenticateToken, requireAdmin, quoteController.getQuotesByProjectId);
router.get('/:id', authenticateToken, requireAdmin, quoteController.getQuoteById);
router.put('/:id', authenticateToken, requireAdmin, quoteController.updateQuoteById);
router.delete('/:id', authenticateToken, requireAdmin, quoteController.deleteQuoteById);

module.exports = router;