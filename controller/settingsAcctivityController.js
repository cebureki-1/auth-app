const pool = require("../config/db");

exports.getUserActivity = async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 4;

    try {
        const likes = await pool.query(`
      SELECT posts.id, posts.title, likes.created_at AS liked_at, users.username AS author
      FROM likes
      JOIN posts ON likes.post_id = posts.id
      JOIN users ON posts.user_id = users.id
      WHERE likes.user_id = $1
      ORDER BY likes.created_at DESC
      LIMIT $2
    `, [userId, limit]);

        const bookmarks = await pool.query(`
      SELECT posts.id, posts.title, bookmarks.created_at AS bookmarks_at, users.username AS author
      FROM bookmarks
      JOIN posts ON bookmarks.post_id = posts.id
      JOIN users ON posts.user_id = users.id
      WHERE bookmarks.user_id = $1
      ORDER BY bookmarks.created_at DESC
      LIMIT $2
    `, [userId, limit]);

        const comments = await pool.query(`
        SELECT comments.id, comments.content, comments.created_at, posts.title AS post
        FROM comments
        JOIN posts ON comments.post_id = posts.id
        WHERE comments.user_id = $1
        ORDER BY comments.created_at DESC
        LIMIT $2
    `, [userId, limit]);


        const views = await pool.query(`
      SELECT posts.id, posts.title, post_views.viewed_at as viewed_at, users.username AS author
      FROM post_views
      JOIN posts ON post_views.post_id = posts.id
      JOIN users ON posts.user_id = users.id
      WHERE post_views.user_id = $1
      ORDER BY post_views.viewed_at DESC
      LIMIT $2
    `, [userId, limit]);

        const reports = await pool.query(`
  SELECT posts.id, reports.description, reports.category, reports.created_at, posts.title AS post_title
  FROM reports
  JOIN posts ON reports.post_id = posts.id
  WHERE reports.user_id = $1
  ORDER BY reports.created_at DESC
`, [userId]);

        console.log("dsfghjgfds");


        res.json({
            likes: likes.rows,
            bookmarks: bookmarks.rows,
            comments: comments.rows,
            views: views.rows,
            reports: reports.rows,
        });

    } catch (err) {
        console.error('Ошибка получения активности:', err);
        res.status(500).json({ message: 'Ошибка сервера при получении активности' });
    }
};

