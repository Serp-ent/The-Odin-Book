const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');
const passport = require('../config/passport-config');
const { ensureResourceAuthor } = require('../controllers/authController');

router.delete("/:id",
  passport.authenticate('jwt', { session: false }),
  ...controller.deleteCommentChain);

module.exports = router;