const express = require("express");
const router = express.Router();
const { FitnessData } = require('../models');
const {
  calculateBMI,
  calculateCalories,
  calculateIdealWeight,
  calculateBodyFat
} = require('../middleware/CalculationsMiddleware');
const authMiddleware = require("../middleware/authMiddleware");

// POST - Create or update fitness data
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { weight, height, age, gender } = req.body;
        const userId = req.user.userId;

        const data = await FitnessData.findOneAndUpdate(
            { userId },
            {
                weight,
                height,
                age,
                gender,
                bmi: calculateBMI(weight, height),
                calories: calculateCalories(weight, height, age, gender),
                idealWeight: calculateIdealWeight(height),
                bodyFat: calculateBodyFat(weight, height, age, gender)
            },
            { new: true, upsert: true }
        );

        res.status(201).json(data);
    } catch (err) {
        console.error("Error saving fitness data:", err);
        res.status(500).json({ error: "Failed to save fitness data" });
    }
});

// GET - Get user's fitness data
router.get("/", authMiddleware, async (req, res) => {
    try {
        const data = await FitnessData.findOne({ userId: req.user.userId });
        res.json(data || {});
    } catch (err) {
        console.error("Error fetching fitness data:", err);
        res.status(500).json({ error: "Failed to fetch fitness data" });
    }
});

// PUT - Update specific fitness record
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { weight, height, age, gender } = req.body;
        const userId = req.user.userId;

        const data = await FitnessData.findOneAndUpdate(
            { _id: req.params.id, userId },
            {
                weight,
                height,
                age,
                gender,
                bmi: calculateBMI(weight, height),
                calories: calculateCalories(weight, height, age, gender),
                idealWeight: calculateIdealWeight(height),
                bodyFat: calculateBodyFat(weight, height, age, gender)
            },
            { new: true }
        );

        if (!data) {
            return res.status(404).json({ error: "Data not found or unauthorized" });
        }

        res.json(data);
    } catch (err) {
        console.error("Error updating fitness data:", err);
        res.status(500).json({ error: "Failed to update fitness data" });
    }
});

// DELETE - Remove fitness record
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const result = await FitnessData.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });
        
        if (!result) {
            return res.status(404).json({ error: "Data not found or unauthorized" });
        }
        
        res.json({ message: "Fitness data deleted successfully" });
    } catch (err) {
        console.error("Error deleting fitness data:", err);
        res.status(500).json({ error: "Failed to delete fitness data" });
    }
});

module.exports = router;