import { API } from './api.js';
import { UI } from './ui.js';

console.log("🚀 App.js is starting NOW!"); 

let allStudents = [];
let studentToDelete = null;
let currentPage = 1;

loadStudents();
setupEventListeners();

// --- Core Logic ---
async function loadStudents() {
    console.log("🔄 Fetching student data...");
    allStudents = await API.fetchStudents();
    
    if(UI.elements.totalCount) UI.elements.totalCount.textContent = allStudents.length;
    applyFilters(); 
}

function setupEventListeners() {
    console.log("👂 Attaching event listeners...");
    
    // 1. Form Submit
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', handleAddStudent);
    }

    // 2. Chat Buttons
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

    // 3. Filters
    document.getElementById('resetFilters').addEventListener('click', () => {
        currentPage = 1; 
        resetFilters();
    });

    ['search', 'filterGender', 'filterYear', 'sortBy', 'itemsPerPage'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', () => {
                currentPage = 1; // Reset to page 1 on search
                applyFilters();
            });
            el.addEventListener('change', () => {
                currentPage = 1; // Reset to page 1 on sort/filter change
                applyFilters();
            });
        }
    });

    // 4. Chat Input
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    if (chatInput && sendBtn) {
        sendBtn.addEventListener('click', handleChat);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
    }

    // 5. Modal & Delete Actions
    document.getElementById('confirmDelete').addEventListener('click', handleConfirmDelete);
    
    window.hideDeleteModal = () => UI.toggleModal(false);
    window.hideNotification = () => UI.hideNotification();

    document.querySelector('#studentsTable tbody').addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-icon-delete');
        if (btn) {
            const id = btn.getAttribute('data-id');
            studentToDelete = allStudents.find(s => s.id === id);
            if (studentToDelete) UI.toggleModal(true, studentToDelete);
        }
    });
}

// --- Handlers ---
async function handleAddStudent(e) {
    e.preventDefault();
    const form = e.target;
    const genderRadio = document.querySelector('input[name="gender"]:checked');
    
    const newStudent = {
        id: form.id.value.trim(),
        name: form.name.value.trim(),
        gender: genderRadio ? genderRadio.value : '',
        gmail: form.gmail.value.trim(),
        program: form.program.value.trim(),
        year: form.year.value,
        university: form.university.value.trim()
    };

    const res = await API.addStudent(newStudent);
    
    if (res.error) {
        UI.showNotification('Error', res.error, 'error');
    } else {
        UI.showNotification('Success', 'Student added successfully.', 'success');
        form.reset();
        loadStudents();
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
      - If asking for a specific student (like "Imee"), find their numbered row and recite the details.
      - Do not summarize unless asked. Be precise.
    `;
    
    try {
        const data = await API.sendChatMessage(smartPrompt);
        UI.addChatMessage(data.reply, 'bot');
    } catch (err) {
        console.error(err);
        UI.addChatMessage("⚠️ Rate Limit Hit. (Tip: Create a new API Key to fix this immediately)", 'bot');
    }
}

// --- Filter & Pagination Logic
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
        
        const baseClass = "px-3 py-1 border rounded text-sm transition-colors";
        const activeClass = "bg-indigo-600 text-white border-indigo-600";
        const inactiveClass = "bg-white text-gray-700 hover:bg-gray-50 border-gray-300";

        btn.className = `${baseClass} ${i === currentPage ? activeClass : inactiveClass}`;
        
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