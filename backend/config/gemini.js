require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = genAI;