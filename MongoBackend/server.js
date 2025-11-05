const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json()); // JSON body read karne ke liye

// ✅ Routes Import (IMPORTANT: .js mat lagao)
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { dbName: 'userDB' })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Failed:", err));


// ✅ API Routes
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);   // ← Ye zaruri tha!


// ✅ Default Route
app.get('/', (req, res) => {
  res.send("💥 Server is Running...");
});


// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`💥 Server Running on Port ${PORT}`));
