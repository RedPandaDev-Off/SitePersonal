const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quotes.controller');


router.get('/', quoteController.getAllQuotes);

/*retrouver tout les devis par client ID*/
router.get('/user/:userId', quoteController.getQuotesByUserId);

/*retrouver tout les devis par status */
router.get('/status/:status', quoteController.getQuotesByStatus);

/*retrouver tout les devis par payment status */
router.get('/payment-status/:paymentStatus', quoteController.getQuotesByPaymentStatus);  

/*rtrouver tout les devis par date range*/
router.get('/date-range/:startDate/:endDate', quoteController.getQuotesByDateRange);

/*mettre a jour un devis par id*/
router.put('/:id', quoteController.updateQuoteById);

/*retrouver devis par project id*/
router.get('/project/:projectId', quoteController.getQuotesByProjectId);
module.exports = router;