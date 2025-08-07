
const pool = require("../config/db");

exports.createPost = async (req, res) => {

  const { title, content, anonymous } = req.body;
  const image = req.file ? req.file.filename : "image.png";
  const user_id = req.user.id;

  try {

    const result = await pool.query(
      `INSERT INTO posts (title, content,  image,user_id, anonymous)
       VALUES ($1, $2, $3 ,$4, $5)
       RETURNING *`,
      [title, content, image, user_id, anonymous]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при создании поста:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        posts.id, 
        posts.title, 
        posts.content, 
        posts.created_at,
        posts.image, 
        posts.anonymous,
        users.username, 
        users.avatar
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.id DESC
    `);

    const processed = result.rows.map(post => {
      if (post.anonymous) {
        return {
          ...post,
          username: null,
          avatar: "anonymous.png"
        };
      }
      return post;
    });

    res.json(processed);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

exports.getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT posts.*, users.username,
      users.avatar  
      FROM posts 
      LEFT JOIN users ON posts.user_id = users.id 
      WHERE posts.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Пост табылмады" });
    }

    const post = result.rows[0];

    const viewResult = await pool.query(
      'SELECT COUNT(*) FROM post_views WHERE post_id = $1',
      [id]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE post_id = $1',
      [id]
    );

    // Если пост анонимный, не отправляем имя
    if (post.anonymous) {
      post.username = null;
      post.avatar = "anonymous.png"
    }

    res.json({
      post: post,
      likesCount: Number(countResult.rows[0].count),
      viewCount: Number(viewResult.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

exports.getLikesAndBookmarks = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Проверка на наличие лайка
    const likeCheck = await pool.query(
      'SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, id]
    );
    const isLiked = likeCheck.rowCount > 0;

    // Проверка на наличие в закладках
    const bookmarkCheck = await pool.query(
      'SELECT 1 FROM bookmarks WHERE user_id = $1 AND post_id = $2',
      [userId, id]
    );
    const isBookmarked = bookmarkCheck.rowCount > 0;

    // Подсчет общего количества лайков
    const likesResult = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE post_id = $1',
      [id]
    );

    res.json({
      isLiked,
      isBookmarked,
      likesCount: parseInt(likesResult.rows[0].count, 10)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};


exports.toggleLike = async (req, res) => {
  const userId = req.user.id;
  const { id: postId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    if (result.rows.length > 0) {
      // Уже лайкнул — убираем
      await pool.query(
        `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
        [userId, postId]
      );
    } else {
      // Ещё не лайкнул — добавляем
      await pool.query(
        `INSERT INTO likes (user_id, post_id) VALUES ($1, $2)`,
        [userId, postId]
      );
    }

    // Считаем количество лайков
    const likeCount = await pool.query(
      `SELECT COUNT(*) FROM likes WHERE post_id = $1`,
      [postId]
    );

    res.json({
      isLiked: result.rows.length === 0, // если добавили
      likesCount: parseInt(likeCount.rows[0].count, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Сервер қатесі' });
  }
};

exports.toggleBookmark = async (req, res) => {
  const userId = req.user.id;
  const { id: postId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    if (result.rows.length > 0) {
      // Уже в закладках — удаляем
      await pool.query(
        `DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
        [userId, postId]
      );
    } else {
      // Добавляем
      await pool.query(
        `INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)`,
        [userId, postId]
      );
    }

    res.json({ isBookmarked: result.rows.length === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Сервер қатесі' });
  }
};

exports.addView = async (req, res) => {
  const userId = req.user.id;
  const { id: postId } = req.params;
  console.log(userId, postId);
  try {
    // пробуем вставить новую запись, если она уже есть — игнорируем
    await pool.query(
      `INSERT INTO post_views (post_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [postId, userId]
    );

    // Считаем уникальные просмотры
    const viewResult = await pool.query(
      'SELECT COUNT(*) FROM post_views WHERE post_id = $1',
      [postId]
    );

    const uniqueViews = parseInt(viewResult.rows[0].count, 10);

    // Обновляем в таблице posts
    await pool.query(
      'UPDATE posts SET views_count = $1 WHERE id = $2',
      [uniqueViews, postId]
    );

    res.json({ message: 'Көру тіркелді', uniqueViews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Сервер қатесі' });
  }
};


exports.deletepost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;
  const result = await pool.query(
    "DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *",
    [postId, userId]
  );


  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Пост не найден или вы не имеете прав на его удаление" });
  }

  res.json({ message: "Пост успешно удалён" });
};


