const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function authenticateJwt(req, res, next) {
  let token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, No token provided" });
  }

  try {
    const secret = process.env.JWT_SECRET;

    token = token?.split(" ")[1];

    const decoded = jwt.verify(token, secret);

    req.username = decoded;

    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Invalid Token" });
  }
}

module.exports = { authenticateJwt };
