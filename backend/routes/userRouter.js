const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController.js');

// router.get('/', controller.getPosts);
router.get('/:id', controller.getUserWithId);

module.exports = router;
