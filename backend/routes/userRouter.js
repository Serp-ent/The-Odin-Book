const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController.js');
const passport = require('../config/passport-config.js');
const upload = require('../config/multer-config.js');

router.get('/followed',
  passport.authenticate('jwt', { session: false }),
  controller.getFollowedUsers);

router.post('/:id/follow',
  passport.authenticate('jwt', { session: false }),
  controller.followUser);

router.get('/:id/posts',
  passport.authenticate('jwt', { session: false }),
  controller.getPostOfUser);

router.get('/',
  passport.authenticate('jwt', { session: false }),
  controller.getUsers,
);

router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  controller.getUserWithId);

router.put('/:id',
  passport.authenticate('jwt', { session: false }),
  upload.single('profilePic'),
  (req, res, next) => {
    const userId = parseInt(req.params.id);
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    next();
  },
  controller.updateUserWithId
);


module.exports = router;
