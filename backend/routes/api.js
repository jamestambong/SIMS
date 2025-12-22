const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const chatController = require('../controllers/chatController');

// Student Routes
router.get('/students', studentController.getAllStudents);
router.post('/students', studentController.addStudent);
router.put('/students/:id', studentController.updateStudent);
router.delete('/students/:id', studentController.deleteStudent);

// Chat Route
router.post('/chat', chatController.handleChat);

module.exports = router;