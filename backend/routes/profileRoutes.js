const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { User } = require('../models'); // Fix path if needed

// Remove "/profile" prefix since it's already in app.js
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password"); // Note: req.user.userId
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  try {
    const { password, email, ...updateData } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId, // Note: req.user.userId
      updateData,
      { new: true }
    ).select("-password");
    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
