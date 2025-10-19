const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

//Swagger docs
//Message schema
/**
 * @openapi
 * components:
 *   schemas:
 *     MessageDoc:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         session: { type: string }
 *         sender: { type: string }
 *         content: { type: string, maxLength: 2000 }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         content: { type: string }
 *         sender: { type: string, description: "Sender name or ID" }
 *         timeSent: { type: string, format: date-time }
 *
 */

//endpoint docs

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




// Endpoints
// Session message routes
router.get('/sessions/:id/messages', messageController.getSessionMessages);
router.post('/sessions/:id/messages', messageController.sendSessionMessage);

module.exports = router;