const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'freelance_db',
  password: process.env.DB_PASSWORD || 'A33lafolie',
  port: parseInt(process.env.DB_PORT) || 5432,
});

pool.connect()
  .then()
  .catch((err) => {
    
    process.exit(1);
  });

module.exports = pool;