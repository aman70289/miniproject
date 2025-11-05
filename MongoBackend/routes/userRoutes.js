const express = require('express');
const User = require('../models/userModel');
const router = express.Router();

// ✅ Create User (POST)
router.post('/add', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.json({ message: "✅ User Added", user: newUser });
  } catch (err) {
    res.status(400).json({ message: "❌ Error Adding User", error: err });
  }
});

// ✅ Get All Users (GET)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "❌ Error Fetching Users", error: err });
  }
});

module.exports = router;
