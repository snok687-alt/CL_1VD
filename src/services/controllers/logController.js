const { pool } = require('../config/db');

exports.getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const [rows] = await pool.query(
      `SELECT * FROM access_logs ORDER BY last_access DESC LIMIT ?`,
      [limit]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching logs' });
  }
};

exports.getTopHits = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT url, SUM(hits) AS total_hits
      FROM access_logs
      GROUP BY url
      ORDER BY total_hits DESC
      LIMIT 10;
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching top hits' });
  }
};
