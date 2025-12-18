import { API } from './api.js';
import { UI } from './ui.js';

console.log("🚀 App.js is starting NOW!"); 

let allStudents = [];
let studentToDelete = null;
let currentPage = 1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    setupEventListeners();
});

// --- Core Logic ---
async function loadStudents() {
    console.log("🔄 Fetching student data...");
    allStudents = await API.fetchStudents();
    
    // Safety check: Ensure API returns an array
    if (!Array.isArray(allStudents)) {
        console.error("Data is not an array:", allStudents);
        allStudents = [];
    }

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
                currentPage = 1; 
                applyFilters();
            });
            el.addEventListener('change', () => {
                currentPage = 1; 
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
    
    // Global helpers for UI.js if needed
    window.hideDeleteModal = () => UI.toggleModal(false);
    window.hideNotification = () => UI.hideNotification();

    const tableBody = document.querySelector('#studentsTable tbody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-icon-delete');
            if (btn) {
                const id = btn.getAttribute('data-id');
                studentToDelete = allStudents.find(s => s.id === id);
                if (studentToDelete) UI.toggleModal(true, studentToDelete);
            }
        });
    }
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
    
    const formattedData = allStudents.map((s, index) => 
        `${index + 1}. [${s.id}] ${s.name} (${s.gender}) - ${s.program} - Year ${s.year} - ${s.university}`
    ).join('\n');

    const total = allStudents.length;

    const smartPrompt = `
      [ROLE] You are an expert Data Analyst.
      [DATABASE] Total Records: ${total}
      [DATA LIST]
      ${formattedData}
      [USER QUESTION] "${message}"
      [INSTRUCTIONS]
      - Use the provided data to answer.
      - If searching for a name, be precise.
    `;
    
    try {
        const data = await API.sendChatMessage(smartPrompt);
        UI.addChatMessage(data.reply, 'bot');
    } catch (err) {
        console.error(err);
        UI.addChatMessage("⚠️ Connection Error. Please try again.", 'bot');
    }
}

// --- Filter & Pagination Logic ---
function applyFilters() {
    const searchEl = document.getElementById('search');
    const genderEl = document.getElementById('filterGender');
    const yearEl = document.getElementById('filterYear');
    
    if (!searchEl || !genderEl || !yearEl) return;

    const search = searchEl.value.toLowerCase();
    const gender = genderEl.value;
    const year = yearEl.value;
    
    let filtered = allStudents.filter(s => {
        return (s.name.toLowerCase().includes(search) || s.program.toLowerCase().includes(search)) &&
               (gender === '' || s.gender === gender) &&
               (year === '' || s.year.toString() === year);
    });

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

    const itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > totalPages) currentPage = 1;
    if (currentPage < 1 && totalPages > 0) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    UI.renderTable(filtered.slice(startIndex, endIndex));

    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        const startDisplay = totalItems === 0 ? 0 : startIndex + 1;
        const endDisplay = Math.min(startIndex + itemsPerPage, totalItems);
        pageInfo.textContent = `${startDisplay}-${endDisplay} of ${totalItems}`;
    }

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
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
            applyFilters();
        };
        paginationContainer.appendChild(btn);
    }
}

function resetFilters() {
    document.getElementById('search').value = '';
    document.getElementById('filterGender').value = '';
    document.getElementById('filterYear').value = '';
    currentPage = 1;
    applyFilters();
}