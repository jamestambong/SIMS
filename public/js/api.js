const BASE_URL = ''; 

export const API = {
    // 1. Fetch All Students
    async fetchStudents() {
        try {
            const response = await fetch(`${BASE_URL}/students`);
            if (!response.ok) throw new Error('Failed to fetch students');
            return await response.json();
        } catch (error) {
            console.error("Fetch Error:", error);
            return [];
        }
    },

    // 2. Add New Student
    async addStudent(student) {
        try {
            const response = await fetch(`${BASE_URL}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student)
            });
            return await response.json();
        } catch (error) {
            console.error("Add Error:", error);
            return { error: 'Failed to connect to server.' };
        }
    },

    // 3. Delete Student
    async deleteStudent(id) {
        try {
            const response = await fetch(`${BASE_URL}/students/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error("Delete Error:", error);
            return { success: false, error: 'Connection failed.' };
        }
    },

    // 4. AI Chat Message
    async sendChatMessage(message) {
        try {
            const response = await fetch(`${BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            return await response.json();
        } catch (error) {
            console.error("Chat Error:", error);
            return { reply: "Server connection failed. Please try again." };
        }
    }
};