const pool = require("../config/db");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

async function registerUser(req, res) {
  const { email, username, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required. " });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (user_name, password_hash, email_id) VALUES ($1, $2, $3)`;

    await pool.query(query, [username, hashedPassword, email]);

    res.status(202).json({
      data: { username, email },
      message: "User registered successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user.", error: error.message });
  }
}

async function loginUser(req, res) {
  const { email, password } = req?.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required. " });
  }

  try {
    const query = "SELECT * FROM users where email_id = $1";

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user?.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET;

    const payload = {
      id: user?.id,
      username: user?.user_name,
    };

    const token = jwt.sign({ payload }, secret, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful.", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
}

function protectedRoute(req, res) {
  res.json({ message: "Welcome to the protected route", user: req.user });
}

module.exports = { registerUser, loginUser, protectedRoute };
