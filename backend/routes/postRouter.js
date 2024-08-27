const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');
const passport = require('../config/passport-config');

router.get('/',
  passport.authenticate('jwt', { session: false }),
  controller.getPosts);

router.post('/',
  passport.authenticate('jwt', { session: false }),
  controller.createPost);

router.post('/:id/like',
  passport.authenticate('jwt', { session: false }),
  controller.likePost);

router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  controller.getPostWithId);

module.exports = router;
