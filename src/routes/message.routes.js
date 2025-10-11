const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

// Endpoints
// Session message routes
router.get('/sessions/:id/messages', messageController.getSessionMessages);
router.post('/sessions/:id/messages', messageController.sendSessionMessage);

module.exports = router;