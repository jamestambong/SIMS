export const API = {
    async fetchStudents() {
        try {
            const res = await fetch('/students');
            return await res.json();
        } catch (err) {
            console.error('Fetch error:', err);
            return [];
        }
    },

    async addStudent(student) {
        const res = await fetch('/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        return await res.json();
    },

    async deleteStudent(id) {
        const res = await fetch(`/students/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return await res.json();
    },

    async sendChatMessage(message) {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        return await res.json();
    }
};