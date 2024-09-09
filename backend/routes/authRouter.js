const express = require('express');
const router = express.Router();
const passport = require('../config/passport-config');

const controller = require('../controllers/authController');

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/register', controller.registerChain);

module.exports = router;