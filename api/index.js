require('dotenv').config();
const express = require('express');
const path = require('path');

// NOTICE THE PATH CHANGE: We use '../' to go out of the 'api' folder
// then into 'backend/routes/api'
const apiRoutes = require('../backend/routes/api'); 

const app = express();

app.use(express.json());

// Serve static frontend files
// '..' goes up to root, then into 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Mount routes
app.use('/api', apiRoutes);

// Export the app for Vercel (Instead of app.listen)
module.exports = app;