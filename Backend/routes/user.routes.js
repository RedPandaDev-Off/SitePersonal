const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');


// Routes publiques
router.post('/login', userController.login);
router.post('/register', userController.addUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Routes pour l'utilisateur connecté (protégées)
router.get('/me', authenticateToken, userController.getMe);
router.put('/me', authenticateToken, userController.updateMe);

// Routes protégées (admin seulement)
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.post('/', authenticateToken, requireAdmin, userController.createClient);
router.get('/:id', authenticateToken, requireAdmin, userController.getUserById);
router.put('/:id', authenticateToken, requireAdmin, userController.updateUserById);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUserById);



module.exports = router;
