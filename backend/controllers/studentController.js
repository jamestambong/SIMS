const supabase = require('../config/supabase');

// Get all students
exports.getAllStudents = async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Database not connected.' });
    
    try {
        const { data, error } = await supabase.from('student').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

// Add a student
exports.addStudent = async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Database not connected.' });
    
    const student = req.body;
    
    // Validation
    if (!student.id || !student.name || !student.gender || !student.gmail || 
        !student.program || !student.year || !student.university) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Check for duplicates
        const { data: existing } = await supabase
            .from('student')
            .select('id')
            .eq('id', student.id)
            .maybeSingle();

        if (existing) return res.status(400).json({ error: 'Student ID already exists.' });

        // Insert new student
        const { data, error } = await supabase.from('student').insert([{
            id: student.id,
            name: student.name,
            gender: student.gender,
            gmail: student.gmail,
            program: student.program,
            year: parseInt(student.year) || 1,
            university: student.university
        }]).select().single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add student' });
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Database not connected.' });
    
    try {
        const { error, count } = await supabase
            .from('student')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        if (count === 0) return res.status(404).json({ error: 'Student not found.' });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete student' });
    }
};