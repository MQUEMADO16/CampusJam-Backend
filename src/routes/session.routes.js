const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

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
