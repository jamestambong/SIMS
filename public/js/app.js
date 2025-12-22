import { API } from './api.js';
import { UI } from './ui.js';

console.log("App.js is starting NOW!"); 

let allStudents = [];
let studentToDelete = null;
let currentPage = 1;

// --- STATE FOR EDITING ---
let isEditing = false;
let editId = null;

loadStudents();
setupEventListeners();

// --- Core Logic ---
async function loadStudents() {
    console.log("Fetching student data...");
    allStudents = await API.fetchStudents();
    
    if(UI.elements.totalCount) UI.elements.totalCount.textContent = allStudents.length;
    applyFilters(); 
}

function setupEventListeners() {
    console.log("👂 Attaching event listeners...");
    
    // 1. Form Submit (Handles both ADD and UPDATE)
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // 2. Table Actions (Delegation for Edit & Delete)
    document.querySelector('#studentsTable tbody').addEventListener('click', (e) => {
        // DELETE BUTTON CLICKED
        const deleteBtn = e.target.closest('.btn-icon-delete');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            studentToDelete = allStudents.find(s => s.id === id);
            if (studentToDelete) UI.toggleModal(true, studentToDelete);
        }

        // EDIT BUTTON CLICKED (NEW)
        const editBtn = e.target.closest('.btn-icon-edit');
        if (editBtn) {
            const id = editBtn.getAttribute('data-id');
            const student = allStudents.find(s => s.id === id);
            if (student) populateForm(student);
        }
    });

    // 3. Chat Buttons
    const toggleChat = document.getElementById('toggle-chat');
    const closeChat = document.getElementById('close-chat');
    const chatWindow = document.getElementById('chat-window');

    if (toggleChat && chatWindow) {
        toggleChat.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
        });
    }

    if (closeChat && chatWindow) {
        closeChat.addEventListener('click', () => {
            chatWindow.classList.add('hidden');
        });
    }

    // 4. Filters
    document.getElementById('resetFilters').addEventListener('click', () => {
        currentPage = 1; 
        resetFilters();
    });

    ['search', 'filterGender', 'filterYear', 'sortBy', 'itemsPerPage'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', () => {
                currentPage = 1; 
                applyFilters();
            });
            el.addEventListener('change', () => {
                currentPage = 1; 
                applyFilters();
            });
        }
    });

    // 5. Chat Input
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    if (chatInput && sendBtn) {
        sendBtn.addEventListener('click', handleChat);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
    }

    // 6. Modal & Delete Actions
    document.getElementById('confirmDelete').addEventListener('click', handleConfirmDelete);
    
    window.hideDeleteModal = () => UI.toggleModal(false);
    window.hideNotification = () => UI.hideNotification();
}

// --- NEW FUNCTION: POPULATE FORM ---
function populateForm(student) {
    const form = document.getElementById('studentForm');
    
    // Fill the inputs
    form.id.value = student.id;
    form.name.value = student.name;
    form.gmail.value = student.gmail;
    form.program.value = student.program;
    form.year.value = student.year;
    form.university.value = student.university;
    
    // Handle Gender Radio Buttons
    const genderRadios = document.getElementsByName('gender');
    for (const radio of genderRadios) {
        if (radio.value === student.gender) {
            radio.checked = true;
        }
    }

    // Set Editing State
    isEditing = true;
    editId = student.id;

    // Change Button Appearance
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Student';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-success'); // Assuming you might add this class, or we use inline style below
    submitBtn.style.backgroundColor = '#10b981';
    
    // Disable ID field (ID cannot be changed)
    form.id.disabled = true;

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- HANDLERS ---

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const genderRadio = document.querySelector('input[name="gender"]:checked');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const studentData = {
        id: form.id.value.trim(),
        name: form.name.value.trim(),
        gender: genderRadio ? genderRadio.value : '',
        gmail: form.gmail.value.trim(),
        program: form.program.value.trim(),
        year: form.year.value,
        university: form.university.value.trim()
    };

    try {
        if (isEditing) {
            // --- UPDATE EXISTING STUDENT ---
            await API.updateStudent(editId, studentData);
            UI.showNotification('Success', 'Student updated successfully.', 'success');
            
            // Reset Edit Mode
            isEditing = false;
            editId = null;
            submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Student';
            submitBtn.classList.add('btn-primary');
            submitBtn.classList.remove('btn-success');
            submitBtn.style.backgroundColor = ''; // Reset to default CSS
            form.id.disabled = false; // Re-enable ID
        } else {
            // --- ADD NEW STUDENT ---
            const res = await API.addStudent(studentData);
            if (res.error) {
                UI.showNotification('Error', res.error, 'error');
            } else {
                UI.showNotification('Success', 'Student added successfully.', 'success');
            }
        }

        form.reset();
        loadStudents(); // Refresh table
    } catch (err) {
        UI.showNotification('Error', err.message || err.error, 'error');
    }
}

async function handleConfirmDelete() {
    if (!studentToDelete) return;
    try {
        const res = await API.deleteStudent(studentToDelete.id);
        if (res.success) {
            UI.toggleModal(false);
            UI.showNotification('Deleted', `${studentToDelete.name} removed.`, 'info');
            loadStudents();
        } else {
            throw new Error(res.error);
        }
    } catch (err) {
        UI.toggleModal(false);
        UI.showNotification('Error', err.message, 'error');
    }
}

async function handleChat() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    UI.addChatMessage(message, 'user');
    input.value = '';
    UI.addChatMessage('Generating...', 'bot');
    
    // 1. PREPARE DATA 
    const formattedData = allStudents.map((s, index) => 
        `${index + 1}. [${s.id}] ${s.name} (${s.gender}) - ${s.program} - Year ${s.year} - ${s.university}`
    ).join('\n');

    const total = allStudents.length;

    // 2. THE PROMPT
    const smartPrompt = `
      [ROLE]
      You are an expert Data Analyst.
      
      [DATABASE]
      Total Records: ${total}
      
      [DATA LIST START]
      ${formattedData}
      [DATA LIST END]
      
      [USER QUESTION]
      "${message}"
      
      [INSTRUCTIONS]
      - The data above is the COMPLETE list of students.
      - Read every single line carefully.
      - If asking for a specific student, find their numbered row and recite details.
    `;
    
    try {
        const data = await API.sendChatMessage(smartPrompt);
        UI.addChatMessage(data.reply, 'bot');
    } catch (err) {
        console.error(err);
        UI.addChatMessage("⚠️ Rate Limit Hit or Server Error.", 'bot');
    }
}

// --- Filter & Pagination Logic ---

function applyFilters() {
    const search = document.getElementById('search').value.toLowerCase();
    const gender = document.getElementById('filterGender').value;
    const year = document.getElementById('filterYear').value;
    
    // 1. Filter Data
    let filtered = allStudents.filter(s => {
        return (s.name.toLowerCase().includes(search) || s.program.toLowerCase().includes(search)) &&
               (gender === '' || s.gender === gender) &&
               (year === '' || s.year.toString() === year);
    });

    // 2. Sort Data
    const sortBy = document.getElementById('sortBy').value;
    const [field, order] = sortBy.split('-');
    
    filtered.sort((a, b) => {
        let valA = a[field], valB = b[field];
        if (field === 'year' || field === 'id') { 
            valA = isNaN(valA) ? valA : parseInt(valA); 
            valB = isNaN(valB) ? valB : parseInt(valB);
        }
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    // 3. Pagination Logic
    const itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Safety checks
    if (currentPage > totalPages) currentPage = 1;
    if (currentPage < 1 && totalPages > 0) currentPage = 1;

    // Calculate Slice indices
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // 4. Render Table (Sliced data)
    UI.renderTable(filtered.slice(startIndex, endIndex));

    // 5. Update Text
    const startDisplay = totalItems === 0 ? 0 : startIndex + 1;
    const endDisplay = Math.min(startIndex + itemsPerPage, totalItems);
    
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `${startDisplay}-${endDisplay} of ${totalItems}`;
    }

    // 6. Render Pagination Buttons
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = ''; // Clear old buttons

    // Hide if only 1 page
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        
        // Simple Tailwind classes logic for visual state
        if (i === currentPage) {
            btn.className = "bg-indigo-600 text-white";
            btn.style.backgroundColor = "#4f46e5";
            btn.style.color = "white";
            btn.style.borderColor = "#4f46e5";
        } else {
            btn.className = "bg-white text-gray-700";
        }
        
        btn.onclick = () => {
            currentPage = i;
            applyFilters(); // Rerender table for specific page
        };
        
        paginationContainer.appendChild(btn);
    }
}

function resetFilters() {
    document.getElementById('search').value = '';
    document.getElementById('filterGender').value = '';
    document.getElementById('filterYear').value = '';
    currentPage = 1; // Reset page
    applyFilters();
}