const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./db');
const userRoutes = require('./routes/user.routes');
const quotesRoutes = require('./routes/quotes.route');


// Vérification explicite de la connexion PostgreSQL au démarrage
pool.connect()
  .then(() => console.log('Connexion à PostgreSQL confirmée depuis server.js'))
  .catch((err) => {
    console.error('Erreur de connexion à PostgreSQL (depuis server.js) :', err);
    process.exit(1);
  });


app.use(cors());
app.use(express.json()); // Pour parser le JSON dans les requêtes POST


// Routes utilisateurs
app.use('/api/users', userRoutes);
// Routes devis
app.use('/api/quotes', quotesRoutes);





app.get('/api/home', (req, res) => {
  res.json({ message: 'Welcome to the homepage!' });
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur lors de la requête :', err);
  } else {
    console.log('Heure actuelle depuis PostgreSQL :', res.rows[0]);
  }
});

app.listen(4000, () => console.log('Backend running on port 4000'));