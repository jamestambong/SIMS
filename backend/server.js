const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');
const CSV_FILE = path.join(__dirname, '../students_data_2.0.csv');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

function readStudents() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function writeStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// Function to import CSV data
function importCSV() {
  if (!fs.existsSync(CSV_FILE)) {
    console.log('CSV file not found');
    return;
  }
  const csvData = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = csvData.split('\n').filter(line => line.trim());
  const students = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 7) {
      students.push({
        id: parts[0].trim(),
        name: parts[1].trim(),
        gender: parts[2].trim(),
        gmail: parts[3].trim(),
        program: parts[4].trim(),
        year: parts[5].trim().replace(/\D/g, '') || '1',
        university: parts[6].trim()
      });
    }
  }
  
  if (students.length > 0) {
    writeStudents(students);
    console.log(`Imported ${students.length} students from CSV`);
  }
}

// Import CSV on startup if students.json is empty
if (readStudents().length === 0) {
  importCSV();
}

app.get('/students', (req, res) => {
  res.json(readStudents());
});

app.post('/students', (req, res) => {
  const students = readStudents();
  const student = req.body;
  // Basic validation
  if (!student.id || !student.name || !student.gender || !student.gmail || !student.program || !student.year || !student.university) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (students.find(s => s.id === student.id)) {
    return res.status(400).json({ error: 'Student ID already exists.' });
  }
  students.push(student);
  writeStudents(students);
  res.status(201).json(student);
});

app.delete('/students/:id', (req, res) => {
  let students = readStudents();
  const id = req.params.id;
  const initialLength = students.length;
  students = students.filter(s => s.id !== id);
  if (students.length === initialLength) {
    return res.status(404).json({ error: 'Student not found.' });
  }
  writeStudents(students);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});