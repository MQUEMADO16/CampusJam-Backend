const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Swagger Docs
/**
 * @openapi
 * tags:
 *   name: Sessions
 *   description: REST API Endpoints for managing sessions
 */

// Session Schema Docs
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
 *         address: { type: string, nullable: true }
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
 */

// Endpoint Docs
/**
 * @openapi
 * /api/sessions:
 *   get:
 *     summary: Get all sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: List of all sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: "#/components/schemas/Session" }
 *       500: { description: Server error }
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Session"
 *     responses:
 *       201:
 *         description: Session created successfully
 *       400: { description: Invalid request body }
 *       500: { description: Server error }
 */

/**
 * @openapi
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session found
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Session" }
 *       404: { description: Session not found }
 *   put:
 *     summary: Update a session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Session" }
 *     responses:
 *       200: { description: Session updated successfully }
 *       404: { description: Session not found }
 *   delete:
 *     summary: Delete a session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Session deleted successfully }
 *       404: { description: Session not found }
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
 *         description: Session marked as complete.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 session: { $ref: "#/components/schemas/Session" }
 */

/**
 * @openapi
 * /api/sessions/{id}/participants:
 *   get:
 *     summary: Get session participants
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of participants.
 *   post:
 *     summary: Add user to session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200: { description: User added to session }
 */

/**
 * @openapi
 * /api/sessions/{id}/participants/{userId}:
 *   delete:
 *     summary: Remove user from session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User removed from session }
 */

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
 *       404: { description: Session not found }
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
 *       404: { description: Session not found }
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
 *       404: { description: Session not found }
 */

/**
 * @openapi
 * /api/sessions/active:
 *   get:
 *     summary: List active sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Active sessions retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: "#/components/schemas/Session" }
 */

/**
 * @openapi
 * /api/sessions/upcoming:
 *   get:
 *     summary: List upcoming sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Upcoming sessions retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: "#/components/schemas/Session" }
 */

/**
 * @openapi
 * /api/sessions/past:
 *   get:
 *     summary: List past sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Past sessions retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: "#/components/schemas/Session" }
 */

// Routes

// --- Base and Specific Routes ---
router.get('/sessions', sessionController.getAllSessions);
router.get('/sessions/active', sessionController.getActiveSessions);
router.get('/sessions/upcoming', sessionController.getUpcomingSessions);
router.get('/sessions/past', sessionController.getPastSessions);
router.get('/sessions/my-sessions', authMiddleware, sessionController.getUserSessions); // This MUST be defined before '/sessions/:id'
router.post('/sessions', authMiddleware, sessionController.createSession);
router.post('/sessions/visibility', authMiddleware, sessionController.setVisibility);
router.put('/sessions/visibility', authMiddleware, sessionController.updateVisibility);

// --- Dynamic /:id Routes ---
router.get('/sessions/:id', sessionController.getSessionById);
router.get('/sessions/:id/visibility', sessionController.getVisibility);
router.put('/sessions/:id', authMiddleware, sessionController.updateSession);
router.delete('/sessions/:id', authMiddleware, sessionController.deleteSessionById);
router.post('/sessions/:id/complete', authMiddleware, sessionController.markComplete);

// --- Dynamic /:id/participants Routes ---
router.get('/sessions/:id/participants', authMiddleware, sessionController.getSessionParticipants);
router.post('/sessions/:id/participants', authMiddleware, sessionController.addUserToSession);
router.delete('/sessions/:id/participants/:userId', authMiddleware, sessionController.removeUserFromSession);


module.exports = router;
