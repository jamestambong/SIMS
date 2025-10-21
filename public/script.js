document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studentForm');
  const tableBody = document.querySelector('#studentsTable tbody');
  const searchInput = document.getElementById('search');
  const filterGenderSelect = document.getElementById('filterGender');
  const filterYearSelect = document.getElementById('filterYear');
  const sortBySelect = document.getElementById('sortBy');
  const resetFiltersBtn = document.getElementById('resetFilters');
  const paginationEl = document.getElementById('pagination');
  const pageInfoEl = document.getElementById('pageInfo');
  const totalCountEl = document.getElementById('totalCount');
  const itemsPerPageSelect = document.getElementById('itemsPerPage');
  
  let ITEMS_PER_PAGE = 20;
  let allStudents = [];
  let filteredStudents = [];
  let currentPage = 1;

  // Notification functions
  window.showNotification = function(title, message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationCard = document.getElementById('notificationCard');
    const icon = document.getElementById('notificationIcon');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    
    // Set content
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Set icon and colors based on type
    if (type === 'success') {
      icon.className = 'fas fa-check-circle text-green-500 text-2xl';
      notificationCard.className = 'bg-white rounded-lg shadow-xl border-l-4 border-green-500 p-4 max-w-md';
    } else if (type === 'error') {
      icon.className = 'fas fa-exclamation-circle text-red-500 text-2xl';
      notificationCard.className = 'bg-white rounded-lg shadow-xl border-l-4 border-red-500 p-4 max-w-md';
    } else if (type === 'info') {
      icon.className = 'fas fa-info-circle text-blue-500 text-2xl';
      notificationCard.className = 'bg-white rounded-lg shadow-xl border-l-4 border-blue-500 p-4 max-w-md';
    }
    
    // Show notification
    notification.classList.remove('translate-x-full');
    notification.classList.add('translate-x-0');
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      hideNotification();
    }, 4000);
  };
  
  window.hideNotification = function() {
    const notification = document.getElementById('notification');
    notification.classList.remove('translate-x-0');
    notification.classList.add('translate-x-full');
  };

  // Delete Modal functions
  let studentToDelete = null;

  window.showDeleteModal = function(student) {
    studentToDelete = student;
    const modal = document.getElementById('deleteModal');
    const nameEl = document.getElementById('deleteStudentName');
    const idEl = document.getElementById('deleteStudentId');
    
    nameEl.textContent = student.name;
    idEl.textContent = `ID: ${student.id} • ${student.program}`;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.hideDeleteModal = function() {
    const modal = document.getElementById('deleteModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    studentToDelete = null;
  };

  document.getElementById('confirmDelete').addEventListener('click', () => {
    if (studentToDelete) {
      const studentName = studentToDelete.name; // Store name before deletion
      const studentId = studentToDelete.id; // Store ID before deletion
      
      fetch(`/students/${studentId}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Delete response:', data);
          if (data.success) {
            hideDeleteModal();
            fetchStudents();
            showNotification('Student Deleted Successfully', `${studentName} has been successfully removed from the system.`, 'info');
          } else {
            hideDeleteModal();
            showNotification('Error', data.error || 'Failed to delete student.', 'error');
          }
        })
        .catch(err => {
          console.error('Delete error:', err);
          hideDeleteModal();
          showNotification('Error', `Failed to delete student: ${err.message}`, 'error');
        });
    }
  });

  function fetchStudents() {
    fetch('/students')
      .then(res => res.json())
      .then(data => {
        allStudents = data;
        applyFiltersAndSort();
        totalCountEl.textContent = data.length;
      });
  }

  function applyFiltersAndSort() {
    let filtered = [...allStudents];
    
    // Apply search filter
    const searchQuery = searchInput.value.toLowerCase().trim();
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery) ||
        s.program.toLowerCase().includes(searchQuery) ||
        s.gender.toLowerCase().includes(searchQuery) ||
        s.university.toLowerCase().includes(searchQuery) ||
        s.id.toLowerCase().includes(searchQuery)
      );
    }
    
    // Apply gender filter
    const genderFilter = filterGenderSelect.value;
    if (genderFilter) {
      filtered = filtered.filter(s => s.gender === genderFilter);
    }
    
    // Apply year filter
    const yearFilter = filterYearSelect.value;
    if (yearFilter) {
      filtered = filtered.filter(s => s.year.toString() === yearFilter);
    }
    
    // Apply sorting
    const sortValue = sortBySelect.value;
    const [sortField, sortOrder] = sortValue.split('-');
    
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (sortField === 'year') {
        aVal = parseInt(a[sortField]) || 0;
        bVal = parseInt(b[sortField]) || 0;
      } else {
        aVal = a[sortField].toString().toLowerCase();
        bVal = b[sortField].toString().toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    filteredStudents = filtered;
    currentPage = 1;
    renderPage();
  }

  function renderPage() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageStudents = filteredStudents.slice(startIndex, endIndex);
    
    pageInfoEl.textContent = `${startIndex + 1}-${Math.min(endIndex, filteredStudents.length)} of ${filteredStudents.length}`;
    
    renderTable(pageStudents);
    renderPagination();
  }

  function renderTable(students) {
    tableBody.innerHTML = '';
    if (students.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="px-6 py-8 text-center text-gray-500">
            <i class="fas fa-inbox text-4xl mb-2"></i>
            <p class="text-lg">No students found</p>
          </td>
        </tr>
      `;
      return;
    }
    
    students.forEach((student, index) => {
      const tr = document.createElement('tr');
      tr.className = index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100';
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${student.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          <div class="flex items-center">
            <span class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${student.gender === 'Male' ? 'bg-slate-50 text-slate-700 border-slate-300' : 'bg-slate-50 text-slate-700 border-slate-300'}">
              <i class="fas ${student.gender === 'Male' ? 'fa-mars' : 'fa-venus'} mr-1.5 ${student.gender === 'Male' ? 'text-blue-600' : 'text-rose-600'}"></i>
              ${student.gender}
            </span>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${student.gmail}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            ${student.program}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${student.year}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${student.university}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="delete-btn text-red-600 hover:text-red-900 transition" data-id="${student.id}">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    paginationEl.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = `relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage();
      }
    };
    paginationEl.appendChild(prevBtn);
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
      addPageButton(1);
      if (startPage > 2) addEllipsis();
    }
    
    for (let i = startPage; i <= endPage; i++) {
      addPageButton(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) addEllipsis();
      addPageButton(totalPages);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = `relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`;
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPage();
      }
    };
    paginationEl.appendChild(nextBtn);
  }

  function addPageButton(page) {
    const btn = document.createElement('button');
    btn.className = `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
      page === currentPage
        ? 'z-10 bg-indigo-600 border-indigo-600 text-white'
        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
    }`;
    btn.textContent = page;
    btn.onclick = () => {
      currentPage = page;
      renderPage();
    };
    paginationEl.appendChild(btn);
  }

  function addEllipsis() {
    const span = document.createElement('span');
    span.className = 'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700';
    span.textContent = '...';
    paginationEl.appendChild(span);
  }

  itemsPerPageSelect.addEventListener('change', () => {
    ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);
    currentPage = 1;
    renderPage();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const genderRadio = document.querySelector('input[name="gender"]:checked');
    const student = {
      id: form.id.value.trim(),
      name: form.name.value.trim(),
      gender: genderRadio ? genderRadio.value : '',
      gmail: form.gmail.value.trim(),
      program: form.program.value.trim(),
      year: form.year.value,
      university: form.university.value.trim()
    };
    // Basic validation
    if (!student.id || !student.name || !student.gender || !student.gmail || !student.program || !student.year || !student.university) {
      showNotification('Validation Error', 'All fields are required.', 'error');
      return;
    }
    if (isNaN(student.year) || student.year < 1 || student.year > 6) {
      showNotification('Validation Error', 'Year must be a number between 1 and 6.', 'error');
      return;
    }
    fetch('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showNotification('Error', data.error, 'error');
        } else {
          form.reset();
          fetchStudents();
          showNotification('Success!', `Student ${student.name} has been added successfully.`, 'success');
        }
      })
      .catch(err => {
        showNotification('Error', 'Failed to add student. Please try again.', 'error');
      });
  });

  tableBody.addEventListener('click', e => {
    if (e.target.closest('.delete-btn')) {
      const btn = e.target.closest('.delete-btn');
      const id = btn.getAttribute('data-id');
      const student = allStudents.find(s => s.id === id);
      if (student) {
        showDeleteModal(student);
      }
    }
  });

  searchInput.addEventListener('input', () => {
    applyFiltersAndSort();
  });

  filterGenderSelect.addEventListener('change', () => {
    applyFiltersAndSort();
  });

  filterYearSelect.addEventListener('change', () => {
    applyFiltersAndSort();
  });

  sortBySelect.addEventListener('change', () => {
    applyFiltersAndSort();
  });

  resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterGenderSelect.value = '';
    filterYearSelect.value = '';
    sortBySelect.value = 'name-asc';
    itemsPerPageSelect.value = '20';
    ITEMS_PER_PAGE = 20;
    applyFiltersAndSort();
  });

  fetchStudents();
});