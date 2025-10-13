const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Endpoints
// TODO: Route all endpoints

// Users
router.get('/users', userController.getAllUsers);
router.post('/users', userController.createUser);

// User Sessions
router.post('/users/:id/sessions', userController.addSessionToUser);
router.delete('/users/:id/sessions/:sessionId', userController.removeSessionFromUser);

module.exports = router;