const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');

const authMiddleware = require('../middleware/authMiddleware')
const upload = require('../middleware/upload');     



// Создать пост (требуется токен)
router.post('/', authMiddleware, upload.single('image'), postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

router.delete("/del/:postId", authMiddleware, postController.deletepost);



router.get('/:id/likeandbookmark', authMiddleware, postController.getLikesAndBookmarks);
router.post('/:id/like', authMiddleware, postController.toggleLike);
router.post('/:id/bookmark', authMiddleware, postController.toggleBookmark);

router.post('/:id/view', authMiddleware, postController.addView);



module.exports = router;
