export const UI = {
    elements: {
        totalCount: document.getElementById('totalCount'),
        tableBody: document.querySelector('#studentsTable tbody'),
        pageInfo: document.getElementById('pageInfo'),
        chatMessages: document.getElementById('chat-messages'),
        notification: document.getElementById('notification'),
        deleteModal: document.getElementById('deleteModal'),
        deleteModalBackdrop: document.getElementById('deleteModalBackdrop')
    },

    renderTable(students) {
        this.elements.tableBody.innerHTML = '';

        if (students.length === 0) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 3rem; color: #9ca3af;">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                        <p>No students found.</p>
                    </td>
                </tr>
            `;
            return;
        }

        students.forEach(student => {
            const row = document.createElement('tr');
            
            // Gender Logic
            const isMale = student.gender === 'Male';
            const badgeClass = isMale ? 'badge-male' : 'badge-female';
            const icon = isMale ? '<i class="fas fa-mars"></i>' : '<i class="fas fa-venus"></i>';

            // --- YEAR LOGIC: "1st Year", "2nd Year", etc. ---
            let num = student.year.toString().replace(/\D/g, ''); 
            if (!num) num = student.year; // Fallback
            
            // Calculate Ordinal Suffix (st, nd, rd, th)
            const n = parseInt(num);
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            const suffix = s[(v - 20) % 10] || s[v] || s[0];
            
            // Final String: "1st Year"
            const cleanYear = `${n}${suffix} Year`; 

            row.innerHTML = `
                <td style="font-family: 'Courier New', monospace; font-weight: 600; color: #6b7280;">${student.id}</td>
                <td style="font-weight: 600; color: #111827; font-size: 0.95rem;">${student.name}</td>
                <td><span class="badge ${badgeClass}">${icon} ${student.gender}</span></td>
                <td style="color: #4b5563;">${student.gmail}</td>
                <td><span style="color: #4f46e5; font-weight: 600;">${student.program}</span></td>
                <td>
                    <span class="badge badge-year">
                        <i class="fas fa-graduation-cap" style="font-size: 0.7rem;"></i> ${cleanYear}
                    </span>
                </td>
                <td style="color: #4b5563; font-size: 0.85rem;">${student.university}</td>
                <td>
                    <button class="btn-icon-delete" data-id="${student.id}" 
                        style="width: 36px; height: 36px; border-radius: 8px; border: none; background: #fef2f2; color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                        onmouseover="this.style.background='#fee2e2'; this.style.transform='scale(1.1)'"
                        onmouseout="this.style.background='#fef2f2'; this.style.transform='scale(1)'"
                    >
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            this.elements.tableBody.appendChild(row);
        });
    },

    addChatMessage(text, sender) {
        const div = document.createElement('div');
        const isBot = sender === 'bot';
        div.className = isBot ? 'chat-bubble chat-bot' : 'chat-bubble chat-user';
        div.innerHTML = isBot ? `<i class="fas fa-robot" style="color:#6366f1; margin-right:6px;"></i> ${text}` : text;
        this.elements.chatMessages.appendChild(div);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        return div; 
    },

    toggleModal(show, student = null) {
        const modal = this.elements.deleteModal;
        const backdrop = this.elements.deleteModalBackdrop;
        if (show && student) {
            document.getElementById('deleteStudentName').textContent = student.name;
            document.getElementById('deleteStudentId').textContent = student.id;
            backdrop.classList.add('show');
            modal.classList.add('show');
        } else {
            modal.classList.remove('show');
            backdrop.classList.remove('show');
        }
    },

    showNotification(title, message, type = 'success') {
        const notif = this.elements.notification;
        const icon = document.getElementById('notificationIcon');
        const titleEl = document.getElementById('notificationTitle');
        const msgEl = document.getElementById('notificationMessage');

        if (type === 'success') { notif.style.borderLeftColor = '#10b981'; icon.className = 'fas fa-check-circle fa-lg text-green-500'; }
        else { notif.style.borderLeftColor = '#ef4444'; icon.className = 'fas fa-times-circle fa-lg text-red-500'; }

        titleEl.textContent = title;
        msgEl.textContent = message;
        notif.classList.add('show');
        setTimeout(() => this.hideNotification(), 3000);
    },

    hideNotification() {
        this.elements.notification.classList.remove('show');
    }
};