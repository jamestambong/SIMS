require('dotenv').config(); // Loads .env file
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Supabase Setup ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required.");
}

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
      .from('student') // Using 'student' table
      .select('*');

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

  if (!student.id || !student.name || !student.gender || !student.gmail || !student.program || !student.year || !student.university) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const { data: existing, error: selectError } = await supabase
      .from('student') // Using 'student' table
      .select('id')
      .eq('id', student.id)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing) {
      return res.status(400).json({ error: 'Student ID already exists.' });
    }

    const { data, error } = await supabase
      .from('student') // Using 'student' table
      .insert([
        {
          id: student.id,
          name: student.name,
          gender: student.gender,
          gmail: student.gmail,
          program: student.program,
          year: parseInt(student.year) || 1,
          university: student.university
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding student:', error.message);
    if (error.code === '23505') { // Postgres duplicate key error
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
    const { error, count } = await supabase
      .from('student') // Using 'student' table
      .delete()
      .eq('id', idToDelete);

    if (error) throw error;
    if (count === 0) {
       return res.status(404).json({ error: 'Student not found.' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// --- Note: The catch-all route was removed ---
// app.use(express.static) handles serving index.html


// --- Start the Server (for local testing) ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  if (!supabase) {
    console.warn("⚠️ Supabase client not initialized. Check environment variables!");
  }
});

// --- Vercel Export ---
module.exports = app;