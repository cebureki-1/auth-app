const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); 

const authRoutes = require("./routes/authRoutes");
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require("./routes/profileRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Routes
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
app.use("/api/profile", profileRoutes);




const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

