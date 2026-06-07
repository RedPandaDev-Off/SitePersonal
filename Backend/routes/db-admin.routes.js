const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/db-admin.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent d'être admin
router.use(authenticateToken, requireAdmin);

// Lecture seule uniquement — pas d'écriture via l'API HTTP
router.get('/tables',       ctrl.getTables);
router.get('/table/:name',  ctrl.getTableData);
router.get('/migrations',   ctrl.getMigrations);

// SUPPRIMÉ pour raisons de sécurité :
// POST /query  → exécuteur SQL libre (backdoor potentielle)
// DELETE /table/:name → TRUNCATE / DROP via HTTP
// → Utiliser Adminer via tunnel SSH à la place

module.exports = router;
