const pool = require("../config/db");
const path = require("path");

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.filename : null;
console.log("dsdsdds");
  try {
    
    
    const result = await pool.query(
      "INSERT INTO posts (title, content, image) VALUES ($1, $2, $3) RETURNING *",
      [title, content, image]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
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
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Пост табылмады" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Сервер қатесі" });
  }
};
