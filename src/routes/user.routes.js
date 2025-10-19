const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

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
 *         name: { type: string, description: "User's full name" }
 *         email: { type: string, format: email, description: "User's email address (unique)" }
 *         password: { type: string, description: "Hashed user password" }
 *         dateOfBirth: { type: string, format: date, description: "User's date of birth" }
 *         campus: { type: string, nullable: true, description: "Campus name or identifier" }
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
 *             genres:
 *               type: array
 *               items: { type: string }
 *             skillLevel:
 *               type: string
 *               enum: [Beginner, Intermediate, Advanced, Expert]
 *               default: Beginner
 *             bio: { type: string, maxLength: 500, nullable: true }
 *         joinedSessions:
 *           type: array
 *           description: "List of sessions the user has joined"
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
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

// Endpoint Docs
/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of all users
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
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
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
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
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */

/**
 * @openapi
 * /api/users/{id}/friends:
 *   get:
 *     summary: Get friends of a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of friends
 *   post:
 *     summary: Add a friend
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: string
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
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend removed successfully
 */

/**
 * @openapi
 * /api/users/{id}/password:
 *   put:
 *     summary: Update user password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
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
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID performing the block
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetId:
 *                 type: string
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
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of blocked users
 */

// Routes
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
router.get('/users/:id/subscription', userController.getSubscription);
router.put('/users/:id/subscription', userController.updateSubscription);

module.exports = router;
