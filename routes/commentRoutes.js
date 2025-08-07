const express = require('express');
const router = express.Router();
const middleware = require("../middleware/authMiddleware")
const commentController = require('../controller/commentController');

router.get('/:postId/comments', commentController.getComments);
router.post('/:postId/comments',middleware, commentController.addComment);

module.exports = router;
