require('dotenv').config();
const express = require('express');
const path = require('path');
// This imports the file you just showed me
const apiRoutes = require('./routes/api'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// IMPORTANT: This combines with routes/api.js
// Result: localhost:3000/api/students
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;