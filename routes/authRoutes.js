const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controller/authController");
const upload = require("../middleware/upload_avatar");

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);

module.exports = router;
