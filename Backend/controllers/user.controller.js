
const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { generateToken } = require('../middleware/auth.middleware');

// Transporter email (SMTP configurable via .env)
const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Validation d'email simple
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation du mot de passe (minimum 6 caractères)
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Récupérer tous les utilisateurs (SANS mot de passe)
async function getAllUsers(req, res) {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
}

// Ajouter un utilisateur (avec mot de passe - pour inscription)
async function addUser(req, res) {
  const { name, email, password, role } = req.body;

  // Validation des champs requis
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Les champs nom, email et mot de passe sont requis" });
  }

  // Validation de l'email
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  // Validation du mot de passe
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  // Empêcher la création d'admin via l'API publique
  const userRole = (role && role.toLowerCase() === 'admin') ? 'client' : (role || 'client');

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Un utilisateur avec cet email existe déjà" });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, userRole]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur addUser:', err);
    res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur" });
  }
}

// Créer un client simple (sans mot de passe - pour les devis)
async function createClient(req, res) {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Les champs nom et email sont requis" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  try {
    // Vérifier si le client existe déjà (retourner SANS mot de passe)
    const existing = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    // Créer un nouveau client sans mot de passe
    const result = await pool.query(
      'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
      [name.trim(), email.toLowerCase().trim(), 'client']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur createClient:', err);
    res.status(500).json({ error: "Erreur lors de la création du client" });
  }
}

// Connexion utilisateur
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Les champs email et mot de passe sont requis" });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      // Message générique pour éviter l'énumération d'utilisateurs
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];

    // Vérifier si l'utilisateur a un mot de passe (clients créés sans mot de passe)
    if (!user.password) {
      return res.status(401).json({ error: "Ce compte n'a pas de mot de passe. Contactez l'administrateur." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Générer le token JWT
    const token = generateToken(user);

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Connexion réussie",
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: "Erreur lors de la connexion" });
  }
}

// Récupérer l'utilisateur connecté via le token
async function getMe(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
}

// Mettre à jour son propre profil (utilisateur connecté)
async function updateMe(req, res) {
  const { name, email, currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Validation de l'email si fourni
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  // Validation du nouveau mot de passe si fourni
  if (newPassword && !isValidPassword(newPassword)) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
  }

  // Si on veut changer le mot de passe, l'ancien est requis
  if (newPassword && !currentPassword) {
    return res.status(400).json({ error: "Le mot de passe actuel est requis pour changer de mot de passe" });
  }

  try {
    // Récupérer l'utilisateur actuel
    const currentUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (currentUser.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const current = currentUser.rows[0];

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email.toLowerCase().trim() !== current.email) {
      const existingEmail = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase().trim(), userId]
      );
      if (existingEmail.rows.length > 0) {
        return res.status(409).json({ error: "Cet email est déjà utilisé par un autre compte" });
      }
    }

    // Vérifier l'ancien mot de passe si on veut le changer
    let finalPassword = current.password;
    if (newPassword) {
      if (!current.password) {
        return res.status(400).json({ error: "Ce compte n'a pas de mot de passe configuré" });
      }

      const isMatch = await bcrypt.compare(currentPassword, current.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Mot de passe actuel incorrect" });
      }

      finalPassword = await bcrypt.hash(newPassword, 12);
    }

    // Mettre à jour l'utilisateur (sans changer le rôle)
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, name, email, role, created_at',
      [
        name ? name.trim() : current.name,
        email ? email.toLowerCase().trim() : current.email,
        finalPassword,
        userId
      ]
    );

    res.json({
      message: "Profil mis à jour avec succès",
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur updateMe:', err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil" });
  }
}

// Récupérer un utilisateur par ID (SANS mot de passe)
async function getUserById(req, res) {
  const { id } = req.params;

  // Validation de l'ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
}

// Mettre à jour un utilisateur par ID (avec hash du mot de passe si fourni)
async function updateUserById(req, res) {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  // Validation de l'ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  // Validation de l'email si fourni
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  // Validation du mot de passe si fourni
  if (password && !isValidPassword(password)) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  try {
    // Récupérer l'utilisateur actuel
    const currentUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (currentUser.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const current = currentUser.rows[0];

    // Hash du mot de passe si fourni, sinon garder l'ancien
    let finalPassword = current.password;
    if (password) {
      finalPassword = await bcrypt.hash(password, 12);
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, name, email, role, created_at',
      [
        name ? name.trim() : current.name,
        email ? email.toLowerCase().trim() : current.email,
        finalPassword,
        role || current.role,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur updateUserById:', err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
  }
}

// Supprimer un utilisateur par ID
async function deleteUserById(req, res) {
  const { id } = req.params;

  // Validation de l'ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  // Empêcher la suppression de son propre compte
  if (req.user && req.user.id === parseInt(id)) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
  }
}

// Demande de réinitialisation de mot de passe
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  // Réponse identique qu'on trouve l'email ou non (sécurité anti-énumération)
  const successResponse = { message: "Si cet email existe, un lien de réinitialisation a été envoyé." };

  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) return res.json(successResponse);

    const user = result.rows[0];

    // Supprimer les anciens tokens de cet utilisateur
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'RedPanDev'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f0f0f;color:#fff;border-radius:12px;">
          <h2 style="color:#a855f7;margin-bottom:8px;">Réinitialisation du mot de passe</h2>
          <p style="color:#aaa;">Bonjour ${user.name},</p>
          <p style="color:#aaa;">Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable <strong>1 heure</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#a855f7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
            Réinitialiser le mot de passe
          </a>
          <p style="color:#666;font-size:12px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          <p style="color:#444;font-size:11px;margin-top:24px;">© RedPanDev — ${process.env.CLIENT_URL}</p>
        </div>
      `,
    });

    res.json(successResponse);
  } catch (err) {
    console.error('Erreur forgotPassword:', err.message);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
  }
}

// Réinitialisation effective du mot de passe
async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token et nouveau mot de passe requis" });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Lien invalide ou expiré. Faites une nouvelle demande." });
    }

    const { user_id } = result.rows[0];

    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user_id]);

    // Supprimer le token utilisé
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user_id]);

    res.json({ message: "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter." });
  } catch (err) {
    console.error('Erreur resetPassword:', err.message);
    res.status(500).json({ error: "Erreur lors de la réinitialisation" });
  }
}

module.exports = {
  getAllUsers,
  addUser,
  createClient,
  login,
  getMe,
  updateMe,
  getUserById,
  updateUserById,
  deleteUserById,
  forgotPassword,
  resetPassword,
};
