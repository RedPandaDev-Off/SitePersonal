
const pool = require('../db');
const bcrypt = require('bcrypt');

// Récupérer tous les utilisateurs
async function getAllUsers(req, res) {
  try { 
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
}

// Ajouter un utilisateur
async function addUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Les champs nom, email et mot de passe sont requis" });
  }
  try {
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role || 'Client']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur", details: err.message });
  }
}

/*connexion utilisateur*/

async function login (req, res) {
  const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Les champs email et mot de passe sont requis" });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Utilisateur non trouvé" });
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Mot de passe incorrect" });
        }
        res.json({ message: "Connexion réussie", user });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la connexion", details: err.message });
    }

}

/* Récupérer un utilisateur par ID*/
async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
}

// Mettre à jour un utilisateur par ID*/
async function updateUserById(req, res) {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING *',
      [name, email, password, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
  }
}


// Supprimer un utilisateur par ID*/
async function deleteUserById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
  }
}

module.exports = {
  getAllUsers,
  addUser,
  login,
  getUserById,
  updateUserById,
  deleteUserById
};
