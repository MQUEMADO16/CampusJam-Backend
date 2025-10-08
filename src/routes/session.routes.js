const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

// Endpoints
// TODO: Route all endpoints
router.get('/sessions', sessionController.getAllSessions);

router.post('/sessions', sessionController.createSession);

module.exports = router;