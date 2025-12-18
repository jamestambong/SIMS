const groq = require('../config/groq');
const supabase = require('../config/supabase');

exports.handleChat = async (req, res) => {
  try {
    const { prompt } = req.body; 

    // 1. FETCH LIVE DATA
    // We query Supabase right now. This ensures the data is 100% fresh.
    // If you added a student 1 second ago, this line grabs them.
    const { data: student, error } = await supabase
        .from('student') 
        .select('*'); // Grab everything for now

    if (error) {
        console.error("Supabase Error:", error);
        return res.status(500).json({ reply: "Database error." });
    }

    // 2. CLEAN THE LIVE DATA (The "Compression")
    // We are NOT using old data. We are taking the FRESH 'students' list 
    // and just removing the junk that makes the AI crash.
    const cleanData = student.map(s => {
        // We create a simple sentence for each student.
        // NOTE: Make sure 'name', 'course', 'year' match your actual database columns!
        // If your column is 'student_name', change s.name to s.student_name below.
        return `Name: ${s.name || s.student_name || 'Unknown'}, Course: ${s.course || s.program || 'N/A'}, Year: ${s.level || s.year || 'N/A'}`;
    }).join("; ");

    console.log(`Sending fresh data for ${student.length} student...`);

    // 3. SEND TO GROQ (Big Model)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          // We inject the CLEAN string into the system prompt
          content: `You are a helpful school registrar. Here is the LIVE database of students: [${cleanData}]. Use this to answer questions.` 
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({ reply: chatCompletion.choices[0]?.message?.content });

  } catch (error) {
    console.error("Groq Error:", error);
    if (error.status === 429) {
        return res.status(429).json({ reply: "⚠️ Daily Limit Reached. The 70b model is too busy/expensive. Try again in 1 hour." });
    }
    res.status(500).json({ reply: "Server Error" });
  }
};