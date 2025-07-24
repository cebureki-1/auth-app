const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require('./routes/postRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
// Routes
// ❗ Подключи маршруты с префиксом
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
// Базовая проверка
app.get("/", (req, res) => {
  res.send("API is running");
});

// Запуск сервера
const PORT = process.env.PORT || 5000;


  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

