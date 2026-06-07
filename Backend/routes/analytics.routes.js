const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Route publique pour enregistrer une visite
router.post('/track', analyticsController.trackVisit);

// Route admin pour consulter les statistiques
router.get('/stats', authenticateToken, requireAdmin, analyticsController.getStats);

module.exports = router;