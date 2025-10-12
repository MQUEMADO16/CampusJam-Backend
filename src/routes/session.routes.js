const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

// Endpoints
// TODO: Route all endpoints

// Sessions
router.get('/sessions', sessionController.getAllSessions);
router.post('/sessions', sessionController.createSession);

// Session by id
router.get('/sessions/:id', sessionController.getSessionById);
router.put('/sessions/:id', sessionController.updateSession);
router.delete('/sessions/:id', sessionController.deleteSessionById);

module.exports = router;