const express = require("express");

const {
  registerUser,
  loginUser,
  protectedRoute,
} = require("../controller/authController");

const { authenticateJwt } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/protected", authenticateJwt, protectedRoute);

module.exports = router;
