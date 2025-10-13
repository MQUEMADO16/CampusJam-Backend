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

// Session participants
router.get('/sessions/:id/participants', sessionController.getSessionParticipants);
router.post('/sessions/:id/participants', sessionController.addUserToSession);
router.delete('/sessions/:id/participants/:userId', sessionController.removeUserFromSession);

// Session visibility
router.get('/sessions/:id/visibility', sessionController.getVisibility);
router.post('/sessions/visibility', sessionController.setVisibility);
router.put('/sessions/visibility', sessionController.updateVisibility);

// Session state
router.post('/sessions/:id/complete', sessionController.markComplete);

// Session listing
router.get('/sessions/active', sessionController.getActiveSessions);
router.get('/sessions/upcoming', sessionController.getUpcomingSessions);
router.get('/sessions/past', sessionController.getPastSessions);

module.exports = router;
