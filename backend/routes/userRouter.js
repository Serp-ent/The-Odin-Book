const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController.js');
const passport = require('../config/passport-config.js');

// router.get('/', controller.getPosts);
router.get('/:id', controller.getUserWithId);

router.get('/followed',
  passport.authenticate('jwt', { session: false }),
  controller.getFollowedUsers);

module.exports = router;
