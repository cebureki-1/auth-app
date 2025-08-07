const express = require('express');
const router = express.Router();
const reportsController = require('../controller/reportsController');
const middleware = require('../middleware/authMiddleware');

router.post('/:postId', middleware, reportsController.createReport);


module.exports = router;