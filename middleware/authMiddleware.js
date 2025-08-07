  // middleware/authMiddleware.js
  const jwt = require("jsonwebtoken");
  const pool = require("../config/db");

  const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Нет токена, доступ запрещен" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);

      if (!userResult.rows.length) {
        return res.status(401).json({ message: "Пользователь не найден" });
      }

      req.user = userResult.rows[0];
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: "Неверный токен" });
    }
  };

  module.exports = protect;
