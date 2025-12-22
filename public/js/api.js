export const API = {
    // 1. Fetch Students
    async fetchStudents() {
        try {
            const res = await fetch('/api/students');
            if (!res.ok) throw new Error(`Server Error: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error('Fetch error:', err);
            return [];
        }
    },

    // 2. Add Student
    async addStudent(student) {
        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        return await res.json();
    },

    // ADD THIS NEW FUNCTION
    async updateStudent(id, updates) {
        const res = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return await res.json();
    },

    // 3. Delete Student
    async deleteStudent(id) {
        const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return await res.json();
    },

    // 4. Chatbot
    async sendChatMessage(prompt) {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }) 
        });
        return await res.json();
    }
};