const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

// Swagger docs
// session schema
/**
 * @openapi
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         _id: { type: string, description: "Mongo ObjectId" }
 *         title: { type: string }
 *         description: { type: string, nullable: true }
 *         host: { type: string, description: "User ObjectId" }
 *         isPublic: { type: boolean }
 *         status:
 *           type: string
 *           enum: [Scheduled, Ongoing, Finished, Cancelled]
 *         startTime: { type: string, format: date-time }
 *         endTime: { type: string, format: date-time, nullable: true }
 *         location: { type: string, nullable: true }
 *         genre: { type: string, nullable: true }
 *         skillLevel:
 *           type: string
 *           enum: [Any, Beginner, Intermediate, Advanced]
 *         instrumentsNeeded:
 *           type: array
 *           items: { type: string }
 *         spotifyPlaylistUrl: { type: string, nullable: true }
 *         attendees:
 *           type: array
 *           items: { type: string }
 *         invitedUsers:
 *           type: array
 *           items: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *     VisibilityGetResponse:
 *       type: object
 *       properties:
 *         visibility: { type: boolean, description: "true if public" }
 *
 *     VisibilityChangeRequest:
 *       type: object
 *       required: [sessionId, isPublic]
 *       properties:
 *         sessionId: { type: string, description: "Session ObjectId" }
 *         isPublic: { type: boolean }
 */

//endpoint docs
/**
 * @openapi
 * /api/sessions/{id}/visibility:
 *   get:
 *     summary: Get session visibility
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Visibility state.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/VisibilityGetResponse" }
 *       400: { description: Session ID missing }
 *       404: { description: Session not found }
 *       500: { description: Server error }
 */

/**
 * @openapi
 * /api/sessions/visibility:
 *   post:
 *     summary: Set session visibility
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/VisibilityChangeRequest" }
 *     responses:
 *       200: { description: Visibility updated }
 *       400: { description: Invalid payload }
 *       404: { description: Session not found }
 *       500: { description: Server error }
 *   put:
 *     summary: Update session visibility
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/VisibilityChangeRequest" }
 *     responses:
 *       200: { description: Visibility updated }
 *       400: { description: Invalid payload }
 *       404: { description: Session not found }
 *       500: { description: Server error }
 */

/**
 * @openapi
 * /api/sessions/{id}/complete:
 *   post:
 *     summary: Mark session as complete
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session marked complete.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 session: { $ref: "#/components/schemas/Session" }
 *       404: { description: Session not found }
 *       500: { description: Server error }
 */

/**
 * @openapi
 * /api/sessions/active:
 *   get:
 *     summary: List active sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Active sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: "#/components/schemas/Session" }
 *       500: { description: Server error }
 *
 * /api/sessions/upcoming:
 *   get:
 *     summary: List upcoming sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Upcoming sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: "#/components/schemas/Session" }
 *       500: { description: Server error }
 *
 * /api/sessions/past:
 *   get:
 *     summary: List past sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Past sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: "#/components/schemas/Session" }
 *       500: { description: Server error }
 */


// Endpoints
// TODO: Route all endpoints

// Sessions

router.get('/sessions', sessionController.getAllSessions);
router.post('/sessions', sessionController.createSession);

// Session visibility
router.get('/sessions/:id/visibility', sessionController.getVisibility);
router.post('/sessions/visibility', sessionController.setVisibility);
router.put('/sessions/visibility', sessionController.updateVisibility);

// Session listing
router.get('/sessions/active', sessionController.getActiveSessions);
router.get('/sessions/upcoming', sessionController.getUpcomingSessions);
router.get('/sessions/past', sessionController.getPastSessions);

// Session by id
router.get('/sessions/:id', sessionController.getSessionById);
router.put('/sessions/:id', sessionController.updateSession);
router.delete('/sessions/:id', sessionController.deleteSessionById);

// Session participants
router.get('/sessions/:id/participants', sessionController.getSessionParticipants);
router.post('/sessions/:id/participants', sessionController.addUserToSession);
router.delete('/sessions/:id/participants/:userId', sessionController.removeUserFromSession);

// Session state
router.post('/sessions/:id/complete', sessionController.markComplete);

module.exports = router;
