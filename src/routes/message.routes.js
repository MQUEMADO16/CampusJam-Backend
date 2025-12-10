const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Swagger Docs
/**
 * @openapi
 * tags:
 *   name: Messages
 *   description: REST API Endpoints for sending and managing messages
 */

// Message Schema Docs
/**
 * @openapi
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id: { type: string, description: "Mongo ObjectId" }
 *         session: { type: string, description: "JamSession ObjectId reference" }
 *         sender: { type: string, description: "User ObjectId reference" }
 *         content: { type: string, maxLength: 2000, description: "Message text content" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

// Endpoint Docs
/**
 * @openapi
 * /api/sessions/{id}/messages:
 *   get:
 *     summary: Get messages for a session
 *     description: Returns oldest-first chat messages for the given session. If none, returns an empty list with an informational message.
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Session ID (Mongo ObjectId)
 *     responses:
 *       200:
 *         description: Messages retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "SUCCESS: Session messages retrieved."
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/MessageResponse"
 *       400:
 *         description: Session ID missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *   post:
 *     summary: Send a message in a session
 *     description: Creates a new message in the specified session.
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Session ID (Mongo ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senderId, content]
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: "User ObjectId of the sender"
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *     responses:
 *       201:
 *         description: Message created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "SUCCESS: Message sent successfully."
 *                 data:
 *                   $ref: "#/components/schemas/MessageDoc"
 *       400:
 *         description: Missing/invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Session not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */

// Routes

// GET /api/messages/conversations - Get list of active conversations (Inbox)
router.get('/messages/conversations', authMiddleware, messageController.getConversations);

// GET /api/messages/dm/:userId - Get conversation history with a specific user
router.get('/messages/dm/:userId', authMiddleware, messageController.getDirectMessages);

// POST /api/messages/dm - Send a message to a user
router.post('/messages/dm', authMiddleware, messageController.sendDirectMessage);

// PUT /api/messages/dm/:senderId/read - Mark messages from a specific sender as read
router.put('/messages/dm/:senderId/read', authMiddleware, messageController.markAsRead);

// GET /api/messages/session/:sessionId - Get messages for a session
router.get('/messages/session/:sessionId', authMiddleware, messageController.getSessionMessages);

// POST /api/messages/session/:sessionId - Send a message to a session
router.post('/messages/session/:sessionId', authMiddleware, messageController.sendSessionMessage);

module.exports = router;
