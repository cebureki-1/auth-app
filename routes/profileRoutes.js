const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { 
  getProfile,
  updateProfile,
  getMyPosts,
  deletepost,
} = require("../controller/profileController");

// Получить инфо о себе
router.get("/", authMiddleware, getProfile);

// Обновить профиль (имя, email, аватар)
router.put("/", authMiddleware, updateProfile);

// Получить только свои посты
router.get("/posts", authMiddleware, getMyPosts);

// Удалить поста

module.exports = router;
