const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/calendar/my-events
// This route is protected, so only a logged-in user can access it.
router.get(
  '/my-events',
  authMiddleware,
  calendarController.getCalendarEvents
);

// --- ADD THIS BLOCK ---
// POST /api/calendar/add-session/:sessionId
router.post(
  '/add-session/:sessionId',
  authMiddleware,
  calendarController.addSessionToCalendar
);
// --- END OF BLOCK ---

module.exports = router;