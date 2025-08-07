const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, username, email, avatar FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const validateInput = (username, email) => {
  const errors = [];

  if (username && (username.length < 3 || username.length > 20)) {
    errors.push('Имя пользователя должно быть от 3 до 20 символов');
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Некорректный email');
    }
  }

  return errors;
};

const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    const updatedFields = [];

    const validationErrors = validateInput(username, email);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const currentUser = await pool.query(
      'SELECT username, email, avatar FROM users WHERE id = $1',
      [userId]
    );

    if (currentUser.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const current = currentUser.rows[0];

    if (username && username !== current.username) {
      const usernameExists = await pool.query(
        "SELECT * FROM users WHERE username = $1 AND id != $2",
        [username, userId]
      );
      if (usernameExists.rows.length > 0) {
        return res.status(400).json({ message: "Имя пользователя уже занято." });
      }

      await pool.query(
        'UPDATE users SET username = $1 WHERE id = $2',
        [username, userId]
      );
      updatedFields.push('username');
    }

    if (email && email !== current.email) {
      const emailExists = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND id != $2",
        [email, userId]
      );
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: "Email уже используется." });
      }

      await pool.query(
        'UPDATE users SET email = $1 WHERE id = $2',
        [email, userId]
      );
      updatedFields.push('email');
    }

    let avatar = current.avatar;
    if (req.file) {
      avatar = `${req.file.filename}`;
      if (current.avatar && current.avatar !== '/uploads/default.png') {
        const oldPath = path.join(__dirname, '..', 'uploads', current.avatar);
        fs.unlink(oldPath, (err) => {
          if (err) console.error('Ошибка удаления аватара:', err.message);
        });
      }

      await pool.query(
        'UPDATE users SET avatar = $1 WHERE id = $2',
        [avatar, userId]
      );
      updatedFields.push('avatar');
    }

    res.status(200).json({
      message: 'Настройки обновлены',
      updated: updatedFields
    });

  } catch (error) {
    console.error('Ошибка при обновлении настроек:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const updatePasswordSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Требуется текущий и новый пароль' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Новый пароль должен быть не менее 6 символов' });
    }

    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'Новый пароль должен отличаться от текущего' });
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [newHashedPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Пароль успешно обновлён'
    });
  } catch (error) {
    console.error('Ошибка при обновлении пароля:', error);
    res.status(500).json({
      success: false,
      message: 'Произошла ошибка при обновлении пароля'
    });
  }
};

const deleteAccount = async (req, res) => {
  const userId = req.user.id;

  await pool.query("DELETE FROM posts WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);

  res.json({ message: "Аккаунт удалён" });
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  updatePasswordSettings,
  deleteAccount
};