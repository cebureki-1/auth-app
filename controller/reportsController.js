const pool = require('../config/db');

exports.createReport = async (req, res) => {
  const userId = req.user.id;
  const post_id = req.params.postId;
  const { description, category } = req.body;

  if (!post_id || !description) {
    return res.status(400).json({ message: 'post_id и description обязательны' });
  }

  try {
    const existing = await pool.query(
      `SELECT * FROM reports WHERE user_id = $1 AND post_id = $2`,
      [userId, post_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Вы уже отправляли репорт на этот пост' });
    }

    const newReport = await pool.query(
      `INSERT INTO reports (user_id, post_id, description, category) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, post_id, description, category || null]
    );

    res.status(201).json({ message: 'Репорт отправлен', report: newReport.rows[0] });
  } catch (err) {
    console.error('Ошибка при создании репорта:', err);
    res.status(500).json({ message: 'Ошибка сервера при отправке репорта' });
  }
};


