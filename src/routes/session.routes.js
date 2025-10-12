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

// Session visibility routes
router.get('/sessions/:id/visibility', sessionController.getVisibility);
router.post('/sessions/visibility', sessionController.setVisibility);
router.put('/sessions/visibility', sessionController.updateVisibility);

// Session state routes
router.post('/sessions/:id/complete', sessionController.markComplete);

// Session listing routes
router.get('/sessions/active', sessionController.getActiveSessions);
router.get('/sessions/upcoming', sessionController.getUpcomingSessions);
router.get('/sessions/past', sessionController.getPastSessions);

module.exports = router;
