const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // если используешь multer для загрузки файлов

// Создать пост (требуется токен)
router.post('/', authMiddleware, upload.single('image'), postController.createPost);

// Получить все посты
router.get('/', postController.getAllPosts);

// Получить один пост по ID
router.get('/:id', postController.getPostById);

module.exports = router;
