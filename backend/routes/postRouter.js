const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');

router.get('/', controller.getPosts);

module.exports = router;
