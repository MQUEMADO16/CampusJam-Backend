const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Swagger Docs
/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: Endpoints for user registration and login
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user and get a JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 *       401:
 *         description: Invalid credentials
 */

router.post('/login', authController.login);

module.exports = router;
