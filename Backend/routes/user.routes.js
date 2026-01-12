const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');


// Récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);

// Ajouter un utilisateur
router.post('/register', userController.addUser);

// Connexion utilisateur
router.post('/login', userController.login);

/* Récupérer un utilisateur par ID*/
router.get('/:id', userController.getUserById);

// Mettre à jour un utilisateur par ID
router.put('/:id', userController.updateUserById);


// Supprimer un utilisateur par ID
router.delete('/:id', userController.deleteUserById);



module.exports = router;
