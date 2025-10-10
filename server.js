const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// ... existing code in server.js
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses')); // <<-- यह नई लाइन जोड़ें
// ...other routes
app.use('/api/courses', require('./routes/courses'));
// app.use('/api/payment', require('./routes/payment')); // <<-- इस लाइन को हटा दें या कमेंट कर दें
app.use('/api/enrollments', require('./routes/enrollment')); // <<-- यह नई लाइन जोड़ें

// ... rest of the code

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));