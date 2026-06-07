const jwt = require('jsonwebtoken');

// SÉCURITÉ: Ne jamais exposer le secret JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Vérifier que JWT_SECRET est défini
if (!JWT_SECRET) {
  console.error('ERREUR CRITIQUE: JWT_SECRET non défini dans les variables d\'environnement');
  process.exit(1);
}

// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
}

// Middleware pour vérifier si l'utilisateur est admin
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.user.role?.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  next();
}

// Fonction pour générer un token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken
  // SÉCURITÉ: Ne pas exporter JWT_SECRET
};
