const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); 

const authRoutes = require("./routes/authRoutes");
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require("./routes/profileRoutes");
const settingsRoutes = require("./routes/settingRoutes");
const commentRoutes = require('./routes/commentRoutes')
const reportsRoutes = require('./routes/reportsRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Routes
app.use('/posts', postRoutes);
app.use('/posts', commentRoutes)
app.use('/posts/reports', reportsRoutes);
app.use('/auth', authRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/settings', settingsRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      message: 'Ошибка загрузки файла',
      details: err.message 
    });
  }
  
  res.status(500).json({ message: 'Internal Server Error' });
});


const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
