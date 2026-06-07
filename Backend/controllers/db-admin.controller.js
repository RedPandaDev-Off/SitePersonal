const pool = require('../db');

// Vérifie qu'un nom de table existe bien dans le schéma public (anti-injection)
async function validateTableName(name) {
  const { rows } = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = $1",
    [name]
  );
  return rows.length > 0;
}

// GET /api/admin/db/tables — liste des tables avec nb lignes et taille
const getTables = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        t.tablename AS name,
        pg_size_pretty(pg_total_relation_size(quote_ident(t.tablename))) AS size,
        pg_total_relation_size(quote_ident(t.tablename)) AS size_bytes,
        (SELECT COUNT(*) FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = t.tablename) AS column_count
      FROM pg_tables t
      WHERE t.schemaname = 'public'
      ORDER BY t.tablename
    `);

    // Récupérer le count de chaque table dynamiquement
    const tables = await Promise.all(rows.map(async (table) => {
      try {
        const countRes = await pool.query(`SELECT COUNT(*) as row_count FROM "${table.name}"`);
        return { ...table, row_count: countRes.rows[0].row_count };
      } catch {
        return { ...table, row_count: '?' };
      }
    }));

    res.json(tables);
  } catch (error) {
    console.error('[db-admin] getTables:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/db/table/:name?page=0 — données paginées d'une table
const getTableData = async (req, res) => {
  const { name } = req.params;
  const page = parseInt(req.query.page) || 0;
  const limit = 50;

  try {
    if (!(await validateTableName(name))) {
      return res.status(400).json({ error: 'Table inconnue' });
    }

    const offset = page * limit;
    const [dataRes, countRes] = await Promise.all([
      pool.query(`SELECT * FROM "${name}" LIMIT $1 OFFSET $2`, [limit, offset]),
      pool.query(`SELECT COUNT(*) as total FROM "${name}"`),
    ]);

    res.json({
      rows: dataRes.rows,
      columns: dataRes.fields.map(f => f.name),
      total: parseInt(countRes.rows[0].total),
      page,
      limit,
    });
  } catch (error) {
    console.error('[db-admin] getTableData:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/admin/db/query — exécute une requête SQL libre
const executeQuery = async (req, res) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'Requête SQL manquante' });
  }

  console.log(`[db-admin] SQL par admin: ${sql.substring(0, 200)}`);
  const start = Date.now();

  try {
    const result = await pool.query(sql);
    const duration = Date.now() - start;

    res.json({
      rows: result.rows || [],
      fields: (result.fields || []).map(f => ({ name: f.name })),
      rowCount: result.rowCount,
      duration,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/admin/db/table/:name?mode=truncate|drop
const deleteTable = async (req, res) => {
  const { name } = req.params;
  const mode = req.query.mode || 'truncate';

  try {
    if (!(await validateTableName(name))) {
      return res.status(400).json({ error: 'Table inconnue' });
    }

    if (mode === 'drop') {
      await pool.query(`DROP TABLE "${name}" CASCADE`);
      console.log(`[db-admin] DROP TABLE "${name}"`);
      res.json({ message: `Table "${name}" supprimée` });
    } else {
      await pool.query(`TRUNCATE TABLE "${name}" RESTART IDENTITY CASCADE`);
      console.log(`[db-admin] TRUNCATE TABLE "${name}"`);
      res.json({ message: `Table "${name}" vidée` });
    }
  } catch (error) {
    console.error('[db-admin] deleteTable:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/db/migrations — statut des migrations
const getMigrations = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT filename, applied_at
      FROM schema_migrations
      ORDER BY filename ASC
    `);
    res.json(rows);
  } catch (error) {
    // Table schema_migrations pas encore créée
    if (error.code === '42P01') return res.json([]);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getTables, getTableData, executeQuery, deleteTable, getMigrations };
