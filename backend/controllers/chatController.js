// backend/controllers/chatController.js
const genAI = require('../config/gemini'); // Import the new config
const supabase = require('../config/supabase');

exports.handleChat = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ reply: "Please type a message." });
    }

    const { data: student, error } = await supabase
        .from('student')
        .select('*');

    if (error) {
        console.error("Supabase Error:", error);
        return res.status(500).json({ reply: "Database connection failed." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const fullPrompt = `
      You are a helpful school registrar assistant for "SIMS".
      
      Here is the LIVE student database:
      ${JSON.stringify(student, null, 2)}

      INSTRUCTIONS:
      - Answer the user's question based ONLY on the data above.
      - If the student is not in the list, say "I cannot find that student."
      - Be polite and concise.

      USER QUESTION:
      "${prompt}"
    `;

    //Generate Answer
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ reply: "Server Error" });
  }
};