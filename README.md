# Student Information Management System (SIMS)

A modern web application to manage student records with a beautiful Tailwind CSS UI.

## ✨ Features
- 📝 Add, view, and delete students
- 🔍 Real-time search/filter by name, program, or gender
- 📄 Pagination with customizable items per page (10, 20, 50, 100)
- ✅ Input validation
- 📊 Automatically loads data from CSV file
- 🎨 Modern, responsive UI with Tailwind CSS
- 📱 Mobile-friendly design
- 🎯 Font Awesome icons

## 🎨 UI Design
- **Tailwind CSS** for modern, utility-first styling
- **Font Awesome** icons for visual enhancement
- Gradient backgrounds and smooth animations
- Responsive design for all screen sizes
- Professional color-coded badges for gender and programs

## 🔧 Backend
- Node.js + Express
- Data stored in `backend/students.json`
- CSV import functionality (`students_data_2.0.csv`)
- API routes:
  - `GET /students` — fetch all students
  - `POST /students` — add a student
  - `DELETE /students/:id` — delete a student

## 🎯 Frontend
- HTML/CSS/JS with **Tailwind CSS**
- Form for student input with labels
- Responsive table with hover effects
- Advanced pagination with ellipsis
- Search/filter box with icon
- Dynamic items-per-page selector

## 🚀 How to Run
1. Install dependencies (first time only):
   ```powershell
   cd backend
   npm install express
   cd ..
   ```
2. Start the server:
   - **Easy way**: Double-click `start-server.bat`
   - **Terminal way**: 
     ```powershell
     cd backend
     node server.js
     ```
3. Open your browser and navigate to: `http://localhost:3000`
4. The CSV data will be automatically imported on first run!



## 📦 Project Structure
```
sims/
├── backend/
│   ├── server.js          # Express server
│   └── students.json      # Student database
├── public/
│   ├── index.html         # Tailwind UI
│   ├── script.js          # Frontend logic
│   └── style.css          # Custom styles
├── students_data_2.0.csv  # Initial data
└── README.md
```


