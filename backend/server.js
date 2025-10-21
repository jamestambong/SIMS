const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js'); // Import Supabase

const app = express();
const PORT = process.env.PORT || 3000;

// --- Supabase Setup ---
// Get these from your Vercel Environment Variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Check if environment variables are loaded
if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required.");
  // Optionally exit or handle this error appropriately in production
  // process.exit(1); // Exit if critical variables are missing
}

// Initialize Supabase client only if keys exist
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;


// --- Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));


// --- API Routes (Using Supabase) ---

// GET all students
app.get('/students', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized.' });
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*'); // Select all columns

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST a new student
app.post('/students', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized.' });
  const student = req.body;

  // Basic validation (keep this)
  if (!student.id || !student.name || !student.gender || !student.gmail || !student.program || !student.year || !student.university) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if ID already exists
    const { data: existing, error: selectError } = await supabase
      .from('students')
      .select('id')
      .eq('id', student.id) // Check if 'id' equals student.id
      .maybeSingle(); // Returns one row or null

    if (selectError) throw selectError;
    if (existing) {
      return res.status(400).json({ error: 'Student ID already exists.' });
    }

    // Insert new student
    const { data, error } = await supabase
      .from('students')
      .insert([ // Supabase expects an array for inserts
        {
          id: student.id,
          name: student.name,
          gender: student.gender,
          gmail: student.gmail,
          program: student.program,
          // Ensure year is an integer
          year: parseInt(student.year) || 1, // Default to 1 if conversion fails
          university: student.university
        }
      ])
      .select() // Return the inserted data
      .single(); // Expecting only one row back

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding student:', error.message);
    // More specific error handling based on Supabase error codes if needed
    if (error.code === '23505') { // Unique constraint violation (likely ID)
        res.status(400).json({ error: 'Student ID already exists (database constraint).' });
    } else {
        res.status(500).json({ error: 'Failed to add student' });
    }
  }
});

// DELETE a student by ID
app.delete('/students/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized.' });
  const idToDelete = req.params.id;

  try {
    const { data, error, count } = await supabase
      .from('students')
      .delete()
      .eq('id', idToDelete); // Match the 'id' column

    if (error) throw error;

    // Check if any rows were actually deleted
    if (count === 0) {
       return res.status(404).json({ error: 'Student not found.' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});


// --- Catch-all Route ---
// Sends index.html for any other requests (like page loads)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


// --- Start the Server (for local testing) ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  if (!supabase) {
    console.warn("⚠️ Supabase client not initialized. Check environment variables for local testing.");
  }
});

// --- Vercel Export ---
module.exports = app;