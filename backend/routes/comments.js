const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { Comment } = require("../models"); 

// Create new comment (authenticated)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const newComment = new Comment({ 
      user: req.user.userId, // From auth middleware
      text 
    });
    await newComment.save();
    
    // Populate user details in response
    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'username -_id');
      
    res.status(201).json({ 
      message: "Comment added!", 
      comment: populatedComment 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Get all comments
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'username -_id')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment (owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const commentToDelete = await Comment.findById(req.params.id);
    if (!commentToDelete) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    if (commentToDelete.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update comment (owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const commentToUpdate = await Comment.findById(req.params.id);
    
    if (!commentToUpdate) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    if (commentToUpdate.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { text },
      { new: true }
    ).populate('user', 'username -_id');
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;