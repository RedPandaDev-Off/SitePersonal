require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const app = express();
const pool = require('./db');
const userRoutes = require('./routes/user.routes');
const quotesRoutes = require('./routes/quotes.route');
const paymentRoutes = require('./routes/payment.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const dbAdminRoutes = require('./routes/db-admin.routes');

// ====================================
// AUTO-MIGRATION au démarrage
// ====================================
async function runMigrations() {
  const client = await pool.connect();
  try {
    // Table de suivi des migrations exécutées
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1', [file]
      );
      if (rows.length > 0) continue; // déjà appliquée

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)', [file]
      );
      await client.query('COMMIT');
      console.log(`[migration] ✓ ${file}`);
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[migration] Erreur:', err.message);
  } finally {
    client.release();
  }
}

// Vérification explicite de la connexion PostgreSQL au démarrage
pool.connect()
  .then(client => { client.release(); return runMigrations(); })
  .catch((err) => {
    console.error('Impossible de se connecter à PostgreSQL:', err.message);
    process.exit(1);
  });

// Trust proxy pour obtenir l'IP réelle derrière Nginx/Docker
app.set('trust proxy', 1);

// ====================================
// SÉCURITÉ - Headers HTTP
// ====================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Désactivé pour permettre le frontend
}));

// ====================================
// SÉCURITÉ - CORS Configuration
// ====================================
const allowedOrigins = [
  'http://localhost',
  'http://localhost:80',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (comme les apps mobiles ou Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqué pour origin: ${origin}`);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ====================================
// SÉCURITÉ - Rate Limiting
// ====================================

// Rate limiter général
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter strict pour le login (protection brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de login par fenêtre
  message: { error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne pas compter les succès
});

// Rate limiter pour la création de compte
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 créations de compte par heure
  message: { error: 'Trop de créations de compte, veuillez réessayer plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Appliquer le rate limiter général
app.use('/api', generalLimiter);

// IMPORTANT: Le webhook Stripe doit recevoir le raw body, donc AVANT express.json()
// On définit juste la route webhook ici avec express.raw()
const paymentController = require('./controllers/payment.controller');
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Parser JSON avec limite de taille
app.use(express.json({ limit: '10kb' }));

// ====================================
// ROUTES
// ====================================

// Appliquer les rate limiters spécifiques aux routes sensibles
app.use('/api/users/login', loginLimiter);
app.use('/api/users/register', registerLimiter);

// Routes utilisateurs
app.use('/api/users', userRoutes);
// Routes devis
app.use('/api/quotes', quotesRoutes);
// Routes paiements Stripe (sauf webhook qui est déjà défini)
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/db', dbAdminRoutes);

// Route de test
app.get('/api/home', (req, res) => {
  res.json({ message: 'Welcome to the homepage!' });
});

// Route de santé pour les health checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ====================================
// GESTION DES ERREURS
// ====================================

// 404 pour les routes API non trouvées
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);

  // Ne pas exposer les détails d'erreur en production
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Erreur serveur interne'
  });
});

// ====================================
// DÉMARRAGE
// ====================================
const PORT = process.env.PORT || 4000;

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur lors de la requête :', err);
  } else {
  
  }
});

app.listen(PORT, () => {

});
