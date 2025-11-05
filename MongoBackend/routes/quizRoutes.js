const express = require("express");
const router = express.Router();
const Quiz = require("../models/quizModel"); // Correct Model Path

// ✅ Add New Question API
router.post("/add", async (req, res) => {
  try {
    const newQuestion = new Quiz(req.body);
    await newQuestion.save();

    res.json({
      success: true,
      message: "✅ Question Added Successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ Get Random Questions API
router.get("/:category/:count", async (req, res) => {
  const { category, count } = req.params;

  try {
    const questions = await Quiz.aggregate([
      { $match: { category } },
      { $sample: { size: parseInt(count) } }
    ]);

    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
