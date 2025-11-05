const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  category: { type: String, required: true },
  question: { type: String, required: true },
  option1: String,
  option2: String,
  option3: String,
  option4: String,
  correctAnswer: String
});

module.exports = mongoose.model("Quiz", quizSchema);
