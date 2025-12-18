const supabase = require('../config/supabase');
const groq = require('../config/groq');

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "llama-3.3-70b-versatile",
    });

    res.json({ reply: chatCompletion.choices[0]?.message?.content || "" });

  } catch (error) {
    console.error("Groq API Error:", error);
    
    // Check if it is a Rate Limit error
    if (error.status === 429) {
       return res.json({ reply: "⚠️ System Overload: I have reached my daily thinking limit. Please try again later." });
    }
    
    res.status(500).json({ error: "AI Service Failed" });
  }
};