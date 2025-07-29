const pool = require("../config/db");

// Получение профиля
const getProfile = async (req, res) => {
  const userId = req.user.id;
  const result = await pool.query("SELECT id, username, email, name FROM users WHERE id = $1", [userId]);
  res.json(result.rows[0]);
};

// Обновление профиля
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, email, name } = req.body;

  await pool.query(
    "UPDATE users SET username = $1, email = $2, name = $3 WHERE id = $4",
    [username, email, name, userId]
  );
  res.json({ message: "Профиль обновлён" });
};

// Получить только свои посты
const getMyPosts = async (req, res) => {
  const userId = req.user.id;
  const result = await pool.query("SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
  res.json(result.rows);
};

// Удаление аккаунта
const deleteAccount = async (req, res) => {
  const userId = req.user.id;

  await pool.query("DELETE FROM posts WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);

  res.json({ message: "Аккаунт удалён" });
};

module.exports = {
  getProfile,
  updateProfile,
  getMyPosts,
  deleteAccount,
};
