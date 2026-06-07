const pool = require('../db');

// Enregistre une visite de page (route publique)
const trackVisit = async (req, res) => {
  try {
    const { path, referrer } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    await pool.query(
      'INSERT INTO page_visits (path, ip_address, referrer, user_agent) VALUES ($1, $2, $3, $4)',
      [path || '/', ip, referrer || null, userAgent]
    );

    res.json({ success: true });
  } catch (error) {
    // Table manquante : ignorer silencieusement (migration pas encore appliquée)
    if (error.code !== '42P01') {
      console.error('Erreur tracking:', error.message);
    }
    res.json({ success: false });
  }
};

// Retourne les statistiques de visites (admin seulement)
const getStats = async (req, res) => {
  try {
    const [totalResult, todayResult, weekResult, dailyResult, pagesResult, uniqueResult] =
      await Promise.all([
        // Total de toutes les visites
        pool.query('SELECT COUNT(*) as total FROM page_visits'),

        // Visites aujourd'hui
        pool.query(
          "SELECT COUNT(*) as total FROM page_visits WHERE visited_at >= CURRENT_DATE"
        ),

        // Visites cette semaine
        pool.query(
          "SELECT COUNT(*) as total FROM page_visits WHERE visited_at >= CURRENT_DATE - INTERVAL '7 days'"
        ),

        // Visites par jour sur 30 jours
        pool.query(`
          SELECT
            TO_CHAR(DATE(visited_at), 'DD/MM') as date,
            COUNT(*) as count
          FROM page_visits
          WHERE visited_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(visited_at), TO_CHAR(DATE(visited_at), 'DD/MM')
          ORDER BY DATE(visited_at) ASC
        `),

        // Pages les plus visitées (30 jours)
        pool.query(`
          SELECT
            path,
            COUNT(*) as count
          FROM page_visits
          WHERE visited_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY path
          ORDER BY count DESC
          LIMIT 10
        `),

        // Visiteurs uniques par IP (30 jours)
        pool.query(`
          SELECT COUNT(DISTINCT ip_address) as total
          FROM page_visits
          WHERE visited_at >= CURRENT_DATE - INTERVAL '30 days'
            AND ip_address IS NOT NULL
        `),
      ]);

    res.json({
      total: parseInt(totalResult.rows[0].total),
      today: parseInt(todayResult.rows[0].total),
      thisWeek: parseInt(weekResult.rows[0].total),
      uniqueVisitors: parseInt(uniqueResult.rows[0].total),
      dailyStats: dailyResult.rows,
      topPages: pagesResult.rows,
    });
  } catch (error) {
    console.error('Erreur analytics stats:', error.message);
    // Table manquante : retourner des stats vides plutôt qu'une erreur 500
    if (error.code === '42P01') {
      return res.json({
        total: 0, today: 0, thisWeek: 0, uniqueVisitors: 0,
        dailyStats: [], topPages: [],
      });
    }
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques',
      detail: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
};

module.exports = { trackVisit, getStats };