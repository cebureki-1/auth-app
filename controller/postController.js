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
    const result = await pool.query("SELECT * FROM posts ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Сервер қатесі" });
  }
};


exports.getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT posts.*, users.username 
      FROM posts 
      LEFT JOIN users ON posts.user_id = users.id 
      WHERE posts.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Пост табылмады" });
    }

    const post = result.rows[0];

    // Если пост анонимный, не отправляем имя
    if (post.anonymous) {
      post.username = null;
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};


