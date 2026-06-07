const express = require('express');
const router = express.Router();
const { getOrCreateInvoice } = require('../controllers/invoice.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Récupère ou crée une facture pour un devis (admin uniquement)
router.get('/:quoteId', authenticateToken, requireAdmin, getOrCreateInvoice);

module.exports = router;
