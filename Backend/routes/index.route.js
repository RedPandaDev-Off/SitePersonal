/*fais moi les route pour la landing page*/
const express = require('express');
const router = express.Router();
router.get('/landing', (req, res) => {
    res.json({ message: 'Welcome to the landing page!' });
});
module.exports = router;
