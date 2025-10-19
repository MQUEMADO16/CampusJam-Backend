const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Endpoints
// TODO: Route all endpoints
router.get('/users', userController.getAllUsers);

router.post('/users', userController.createUser);

router.get('/users/search', userController.searchUser);

router.post('/users/:id/report', userController.reportUser);

module.exports = router;