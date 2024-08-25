const express = require('express');
const router = express.Router();
const passport = require('../config/passport-config');

const controller = require('../controllers/authController');

router.post('/login',
  passport.authenticate('local'),
  (req, res) => {
    console.log('user:', req.user)
    console.log('sessionId:', req.sessionID);
    res.status(200).json({ status: 'success', userId: req.user.id });
  }
);

router.post('/logout', controller.logout);
router.post('/register', controller.register);

module.exports = router;