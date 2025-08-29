require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/routes');
const profileRoutes = require("./routes/profileRoutes");
const commentRoutes = require('./routes/comments');
const fitnessDataRoutes = require('./routes/calculations');
const articleRoutes = require('./routes/articles');

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// 🔗 **Connect to MongoDB**
mongoose
  .connect(process.env.MONGO_URI) // ✅ Removed deprecated options
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err);
    process.exit(1);
  });

// 🛠 **Middleware**
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// 🔑 **Routes**
app.use("/api/auth", authRoutes);
app.use("/api/profile", authMiddleware, profileRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/calculations', fitnessDataRoutes);
app.use('/api/article', articleRoutes);



// 🚀 **Start Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
