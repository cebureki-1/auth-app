const pool = require('../config/db');

exports.getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(
      'SELECT c.id, c.content, c.created_at, u.username, u.avatar  FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at ASC',
      [postId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении комментариев' });
  }
};

exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id; 

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Комментарий не может быть пустым' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
      [postId, userId, content]
    );

    const userRes = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    const username = userRes.rows[0].username;
    res.status(201).json({ ...result.rows[0], username });
  } catch (error) {
    console.error('Ошибка добавления комментария:', error);
    res.status(500).json({ message: 'Ошибка сервера при добавлении комментария' });
  }
};
