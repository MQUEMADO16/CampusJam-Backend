const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Swagger Docs
/**
 * @openapi
 * tags:
 *   name: Users
 *   description: REST API Endpoints for managing users
 */

// User Schema Docs
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string, description: "Mongo ObjectId" }
 *         name: { type: string, description: "User's full name", example: "Miguel Quemado" }
 *         email: { type: string, format: email, description: "User's email address (unique)", example: "miguel@example.com" }
 *         password: { type: string, description: "Hashed user password", example: "MySecretPassword123" }
 *         dateOfBirth: { type: string, format: date, description: "User's date of birth", example: "2000-01-01" }
 *         campus: { type: string, nullable: true, description: "Campus name or identifier", example: "Main Campus" }
 *         subscription:
 *           type: object
 *           properties:
 *             tier:
 *               type: string
 *               enum: [basic, pro]
 *               default: basic
 *               description: "Subscription tier"
 *         profile:
 *           type: object
 *           properties:
 *             instruments:
 *               type: array
 *               items: { type: string }
 *               example: ["Guitar", "Piano"]
 *             genres:
 *               type: array
 *               items: { type: string }
 *               example: ["Jazz", "Blues"]
 *             skillLevel:
 *               type: string
 *               enum: [Beginner, Intermediate, Advanced, Expert]
 *               default: Beginner
 *             bio: { type: string, maxLength: 500, nullable: true, example: "I love playing jazz guitar." }
 *         joinedSessions:
 *           type: array
 *           items: { type: string, description: "Session ObjectId reference" }
 *         connections:
 *           type: object
 *           properties:
 *             following:
 *               type: array
 *               items: { type: string, description: "User ObjectId being followed" }
 *             followers:
 *               type: array
 *               items: { type: string, description: "User ObjectId of follower" }
 *         blockedUsers:
 *           type: array
 *           items: { type: string, description: "User ObjectId of blocked users" }
 *         integrations:
 *           type: object
 *           properties:
 *             googleId: { type: string, nullable: true }
 *             spotify:
 *               type: object
 *               properties:
 *                 id: { type: string, nullable: true }
 *                 topGenres:
 *                   type: array
 *                   items: { type: string }
 *                   example: ["Jazz", "Funk"]
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

// --------------------- USER CRUD ---------------------

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *       500:
 *         description: Server error
 */

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       404:
 *         description: User not found
 */

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Miguel Quemado"
 *               email:
 *                 type: string
 *                 example: "miguel@example.com"
 *               password:
 *                 type: string
 *                 example: "MySecretPassword123"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Miguel Q."
 *               email:
 *                 type: string
 *                 example: "miguelq@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

// --------------------- FRIENDS ---------------------

/**
 * @openapi
 * /api/users/{id}/friends:
 *   get:
 *     summary: Get friends of a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of friends
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 */

/**
 * @openapi
 * /api/users/{id}/friends:
 *   post:
 *     summary: Add a friend
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [friendId]
 *             properties:
 *               friendId:
 *                 type: string
 *                 example: "671282ea3e05d63f11a8f89b"
 *     responses:
 *       200:
 *         description: Friend added successfully
 */

/**
 * @openapi
 * /api/users/{id}/unfriend:
 *   put:
 *     summary: Remove a friend
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [friendId]
 *             properties:
 *               friendId:
 *                 type: string
 *                 example: "671282ea3e05d63f11a8f89b"
 *     responses:
 *       200:
 *         description: Friend removed successfully
 */

// --------------------- SESSIONS ---------------------

/**
 * @openapi
 * /api/users/{id}/sessions:
 *   post:
 *     summary: Add a session to a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "671282ea3e05d63f11a8f89b"
 *     responses:
 *       200:
 *         description: Session added to user successfully
 */

/**
 * @openapi
 * /api/users/{id}/sessions/{sessionId}:
 *   delete:
 *     summary: Remove a session from a user (leave)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: sessionId
 *         schema: { type: string }
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session removed from user successfully
 */

// --------------------- SUBSCRIPTION ---------------------

/**
 * @openapi
 * /api/users/{id}/subscription:
 *   get:
 *     summary: Get a user's subscription
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Subscription info retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tier:
 *                   type: string
 *                   enum: [basic, pro]
 *                   example: "pro"
 */

/**
 * @openapi
 * /api/users/{id}/subscription:
 *   put:
 *     summary: Update a user's subscription
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
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
 *                 example: "pro"
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 */

// --------------------- SECURITY / PRIVACY ---------------------

/**
 * @openapi
 * /api/users/{id}/password:
 *   put:
 *     summary: Update user password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "OldPass123"
 *               newPassword:
 *                 type: string
 *                 example: "NewSecurePass456"
 *     responses:
 *       200:
 *         description: Password updated successfully
 */

/**
 * @openapi
 * /api/users/{id}/block:
 *   put:
 *     summary: Block another user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID performing the block
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetId]
 *             properties:
 *               targetId:
 *                 type: string
 *                 example: "671282ea3e05d63f11a8f89b"
 *     responses:
 *       200:
 *         description: User blocked successfully
 */

/**
 * @openapi
 * /api/users/{id}/blocked:
 *   get:
 *     summary: Get all blocked users
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of blocked users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 */

// --------------------- ACTIVITY ---------------------

/**
 * @openapi
 * /api/users/{id}/activity:
 *   get:
 *     summary: Get a user's joined, hosted, and invited sessions
 *     description: Returns all jam sessions the user is hosting, attending, or invited to.
 *     tags: [Users]
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
 *                   $ref: "#/components/schemas/User"
 *                 hostedSessions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: "Session ObjectId"
 *                 joinedSessions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: "Session ObjectId"
 *                 invitedSessions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: "Session ObjectId"
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
 *                 message: { type: string }
 */

// --------------------- REPORTS ---------------------

/**
 * @openapi
 * /api/users/{id}/report:
 *   post:
 *     summary: Report a user
 *     description: Creates a report against a user for inappropriate behavior.
 *     tags: [Users]
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

// Routes

// Public
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.get('/users/search', userController.searchUser);

// Protected
router.put('/users/:id', authMiddleware, userController.updateUser);
router.delete('/users/:id', authMiddleware, userController.deleteUser);

router.post('/users/:id/friends', authMiddleware, userController.addFriend);
router.put('/users/:id/unfriend', authMiddleware, userController.removeFriend);
router.get('/users/:id/friends', authMiddleware, userController.getFriends);

router.put('/users/:id/password', authMiddleware, userController.updatePassword);
router.put('/users/:id/block', authMiddleware, userController.blockUser);
router.get('/users/:id/blocked', authMiddleware, userController.getBlockedUsers);

router.post('/users/:id/sessions', authMiddleware, userController.addSessionToUser);
router.delete('/users/:id/sessions/:sessionId', authMiddleware, userController.removeSessionFromUser);
router.get('/users/:id/subscription', authMiddleware, userController.getSubscription);
router.put('/users/:id/subscription', authMiddleware, userController.updateSubscription);

router.get('/users/:id/subscription', authMiddleware, userController.getSubscription);
router.put('/users/:id/subscription', authMiddleware, userController.updateSubscription);

router.get('/users/:id/activity', authMiddleware, userController.getUserActivity);
router.post('/users/:id/report', authMiddleware, userController.reportUser);

module.exports = router;
