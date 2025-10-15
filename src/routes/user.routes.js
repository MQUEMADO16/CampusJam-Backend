const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Endpoints
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/users/:id/friends', userController.addFriend);
router.put('/:id/password', userController.updatePassword);
router.put('/users/:id/block', userController.blockUser);
router.get('/users/:id/blocked', userController.getBlockedUsers);
router.put('/users/:id/unfriend', userController.removeFriend);
router.get('/users/:id/friends', userController.getFriends);

module.exports = router;
