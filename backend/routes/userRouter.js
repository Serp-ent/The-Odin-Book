const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController.js');
const passport = require('../config/passport-config.js');

// router.get('/', controller.getPosts);

// Define before to prevent pattern matching
router.get('/followed',
  passport.authenticate('jwt', { session: false }),
  controller.getFollowedUsers);

router.post('/:id/follow',
  passport.authenticate('jwt', { session: false }),
  controller.followUser);

router.get('/:id/posts',
  passport.authenticate('jwt', { session: false }),
  controller.getPostOfUser);

router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  controller.getUserWithId);


module.exports = router;
