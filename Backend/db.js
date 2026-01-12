const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'freelance_db',
  password: 'A33lafolie',
  port: 5432, // port par défaut de PostgreSQL
});

pool.connect()
  .then(() => console.log('Connexion à PostgreSQL réussie'))
  .catch((err) => {
    console.error('Erreur de connexion à PostgreSQL :', err);
    process.exit(1);
  });

module.exports = pool;