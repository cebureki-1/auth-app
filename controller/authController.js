const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const avatar = req.file?.filename;

  // ✅ Исправлено: было name, теперь username
  if (!username || !email || !password || !avatar) {
    return res.status(400).json({ message: "Все поля обязательны." });
  }

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Пользователь уже существует." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password, avatar) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, hashedPassword, avatar]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      id: user.id,
      name: user.username, // ✅ Исправлено: user.username вместо user.name
      email: user.email,
      avatar: user.avatar,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Неверный email или пароль." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({
      id: user.id,
      name: user.username, 
      email: user.email,
      avatar: user.avatar,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
