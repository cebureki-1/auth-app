const express = require('express');
const router = express.Router();
  
const { getUserSettings, updateUserSettings, updatePasswordSettings, deleteAccount } = require('../controller/settingsController');
const activity = require('../controller/settingsAcctivityController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/upload_avatar');

router.get('/', protect, getUserSettings);
router.put('/', protect, upload.single('avatar'), updateUserSettings);
router.put('/password', protect, updatePasswordSettings);
router.delete("/", protect, deleteAccount);

router.get('/activity', protect,activity.getUserActivity); 
  
module.exports = router;