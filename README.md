# 🎓 SIMS (Student Information Management System)

> A modern, premium-styled Student Management System featuring real-time data handling and an integrated AI Assistant powered by Groq (LLaMA 3).

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### 🎨 Premium UI/UX
* **Modern Design:** Clean, "glassmorphism" aesthetic with soft shadows and gradients.
* **Dynamic Badges:** Color-coded pills for Gender and Year levels (e.g., "1st Year", "2nd Year").
* **Interactive Elements:** Hover animations on table rows and action buttons.
* **Responsive:** Fully adaptive layout that works on different screen sizes.

### 🤖 AI-Powered Assistant
* **Context-Aware Chat:** The built-in chatbot knows your database! Ask questions like *"How many students are in BSCS?"* or *"Is Bruce Wayne enrolled?"* and get instant answers.
* **Live Updates:** The AI reads the live table data, so it knows immediately when you add or delete a student.
* **Powered by Groq:** Uses the `llama-3.3-70b` model for high-accuracy data analysis.

### 🛠 Core Functionality
* **CRUD Operations:** Create, Read, Update (Planned), and Delete student records.
* **Smart Filtering:** Filter by Gender, Year Level, or Search by Name/Program.
* **Sorting:** Sort records by Name (A-Z) or ID.
* **Pagination:** Handle large datasets with a clean, numbered pagination system.
* **Data Validation:** Prevents duplicate IDs and ensures correct data formats.

---

## 🚀 Tech Stack

* **Frontend:** HTML5, CSS3 (Custom + Tailwind Utility Classes), Vanilla JavaScript (ES6 Modules)
* **Backend:** Node.js, Express.js
* **Database:** Supabase (PostgreSQL)
* **AI Integration:** Groq SDK (`llama-3.3-70b-versatile`)
* **Icons:** FontAwesome 6

---

## 🛠️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/sims-project.git](https://github.com/yourusername/sims-project.git)
cd sims-project