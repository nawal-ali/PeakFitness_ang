const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
// const User = require('../models'); 
const { User, Article } = require('../models');
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();


const authenticateToken = require('../middleware/authMiddleware');
const { blacklistToken } = require("../middleware/tokenBlacklist");


require('dotenv').config();

// get all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, '-password -__v  -weight -height -gender -age -resetPasswordToken'); // Exclude password other information
    res.json({ number: users.length, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId)
      .select('-password -__v -role -weight -height -age -gender -resetPasswordToken'); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

//delete user
router.delete('/users/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

//add or remove article to saved articles
router.post('/users/:id/saved-articles', authenticateToken, async (req, res) => {
  const userId = req.params.id;
  const { articleId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Check if articleId is already in savedArticles
    const articleIndex = user.savedArticles.indexOf(articleId);
    if (articleIndex > -1) {
      // If it exists, remove it
      user.savedArticles.splice(articleIndex, 1);
      res.json({ message: 'Article removed from saved articles', savedArticles: user.savedArticles });
    } else {
      // If it doesn't exist, add it
      user.savedArticles.push(articleId);
      res.json({ message: 'Article added to saved articles', savedArticles: user.savedArticles });
    }
    await user.save();
  } catch (err) {
    console.error("Error updating saved articles:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// **Sign-Up**
router.post('/signup', async (req, res) => {
  const { username, email, password, weight,
    height,
    gender,
    age, } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Create user WITHOUT verification token
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      weight,
      height,
      gender,
      age
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// **Sign-In**
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("Login Route - JWT_SECRET:", process.env.JWT_SECRET, "Token:", token);

    res.cookie('token', token, { httpOnly: true })
      .json({ action: 'success', token, userId: user._id, role: user.role });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// **Sign-Out**
router.post("/logout", authenticateToken, (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(400).json({ message: "No token provided" });

  blacklistToken(token);  // Add token to the blacklist
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});


// **Forgot Password Route**
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = resetToken;
    await user.save();

    res.status(200).json({
      message: 'Debug mode: Use this link to reset password',
      resetLink: `http://localhost:5000/api/auth/reset-password/${resetToken}`
    });


  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// **Verify Reset Token & Change Password**
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      email: decoded.email,
      resetPasswordToken: token // Ensure token matches
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password and clear token
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

//add admin route
// router.post('/registeradmin', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "Email already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newAdmin = new User({
//       username,
//       email,
//       password: hashedPassword,
//       role: "admin"
//     });

//     await newAdmin.save();
//     res.status(201).json({ message: "Admin user created" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.post('/register-admin', async (req, res) => {
  console.log("Register admin endpoint hit!"); // Debug line
  try {
    const { username, email, password } = req.body;
    console.log("Received data:", { username, email }); // Don't log password

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      username,
      email,
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();
    console.log("New admin created:", email);
    res.status(201).json({ message: "Admin user created" });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//admin route
router.get("/admin/dashboard", verifyAdmin, (req, res) => {
  res.json({ message: "Hello Admin" });
});


// router.post('/:id/like', authenticateToken, async (req, res) => {
//   try {
//     const article = await Article.findById(req.params.id);
//     if (!article) {
//       return res.status(404).send({ message: 'Article not found' });
//     }

//     const userId = req.user._id;
//     const likeIndex = article.likes.indexOf(userId);

//     if (likeIndex === -1) {
//       // Like the article
//       article.likes.push(userId);
//     } else {
//       // Unlike the article
//       article.likes.splice(likeIndex, 1);
//     }

//     article.likesCount = article.likes.length;
//     await article.save();

//     res.send({
//       likes: article.likes,
//       likesCount: article.likesCount
//     });
//   } catch (error) {
//     res.status(500).send({ message: 'Error updating like status', error });
//   }
// });

module.exports = router;
