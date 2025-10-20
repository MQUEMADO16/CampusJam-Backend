const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Swagger doc for last 5 endpoints
/**
 * @openapi
 * /api/users/{id}/activity:
 *   get:
 *     summary: Get a user's joined, hosted, and invited sessions
 *     description: Returns all jam sessions the user is hosting, attending, or invited to.
 *     tags: [Activity]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID (Mongo ObjectId)
 *     responses:
 *       200:
 *         description: User activity retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/UserBasic"
 *                 hostedSessions:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/JamSession"
 *                 joinedSessions:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/JamSession"
 *                 invitedSessions:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/JamSession"
 *       404:
 *         description: No activity found for this user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
*       500:
*         description: Server error
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
 */

/**
 * @openapi
 * /api/users/{id}/report:
 *   post:
 *     summary: Report a user
 *     description: Creates a report against a user for inappropriate behavior.
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Reported User ID (Mongo ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reportedBy, reason]
 *             properties:
 *               reportedBy:
 *                 type: string
 *                 description: User ID of the reporter
 *               reason:
 *                 type: string
 *                 description: Reason for reporting
 *     responses:
 *       201:
 *         description: User reported successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User reported successfully"
 *       400:
 *         description: Invalid input (missing fields or reporting self)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Reported user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       500:
 *          description: Server error
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                    message:
 *                      type: string
 */

/**
 * @openapi
 * /api/users/{id}/subscription:
 *   get:
 *     summary: Get a user's subscription
 *     description: Retrieves the current subscription tier for the user.
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID (Mongo ObjectId)
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscription:
 *                   $ref: "#/components/schemas/Subscription"
 *       404:
 *         description: User not found.
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
 *   put:
 *     summary: Update a user's subscription
 *     description: Updates the subscription tier (basic/pro) for a user.
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID (Mongo ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tier]
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [basic, pro]
 *                 description: Subscription tier to set
 *     responses:
 *       200:
 *         description: Subscription updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 subscription:
 *                   $ref: "#/components/schemas/Subscription"
 *       400:
 *         description: Invalid subscription tier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */

/**
 * @openapi
 * /api/users/search:
 *   get:
 *     summary: Search users by name
 *     description: Returns a list of users whose names match the search query (case-insensitive).
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema: { type: string }
 *         description: Partial or full username to search
 *     responses:
 *       200:
 *         description: List of matching users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/UserBasic"
 *       400:
 *         description: Missing username query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: No matching users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */

// Endpoints
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.post('/users/:id/friends', userController.addFriend);
router.put('/users/:id/password', userController.updatePassword);
router.put('/users/:id/block', userController.blockUser);
router.get('/users/:id/blocked', userController.getBlockedUsers);
router.put('/users/:id/unfriend', userController.removeFriend);
router.get('/users/:id/friends', userController.getFriends);
router.post('/users/:id/sessions', userController.addSessionToUser);
router.delete('/users/:id/sessions/:sessionId', userController.removeSessionFromUser);
router.get('/users/:id/activity', userController.getUserActivity);
router.post('/users/:id/report', userController.reportUser);
router.get('/users/:id/subscription', userController.getSubscription);
router.put('/users/:id/subscription', userController.updateSubscription);
router.get('/users/search', userController.searchUser);

module.exports = router;
