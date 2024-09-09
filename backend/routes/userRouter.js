const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController.js');
const passport = require('../config/passport-config.js');
const upload = require('../config/multer-config.js');

/**
 * Empty Followed List: Handle cases where the user has no followed users.
Unauthorized Access: Ensure that requests without a valid JWT token are correctly rejected.
Authorization Issues: Test with expired or invalid tokens.
Rate Limiting: Ensure the route handles rate limiting if applicable.
 */
router.get('/followed',
  passport.authenticate('jwt', { session: false }),
  controller.getFollowedUsers);

/**
 * Valid Follow Request: Ensure following a user works as expected with a valid ID.
Invalid User ID: Handle cases where the user ID does not exist or is not a valid integer.
Already Following: Ensure the route correctly handles attempts to follow a user who is already followed.
Self-Following: Prevent users from following themselves (if applicable).
Authorization: Test with valid and invalid tokens.
Authorization Issues: Test with expired or invalid tokens.
Rate Limiting: Ensure the route handles rate limiting if applicable.
 */
router.post('/:id/follow',
  passport.authenticate('jwt', { session: false }),
  controller.followUser);

/**
 * Valid User ID: Ensure it returns posts for a valid user ID.
Invalid User ID: Handle cases where the user ID does not exist or is not a valid integer.
Empty Posts: Handle scenarios where the user has no posts.
Authorization: Test with valid and invalid tokens.
Authorization Issues: Test with expired or invalid tokens.

 */
router.get('/:id/posts',
  passport.authenticate('jwt', { session: false }),
  controller.getPostOfUser);

/**
 * Empty User List: Handle cases where there are no users in the database.
Pagination: Test boundary cases if pagination or limits are implemented.
Authorization: Ensure unauthorized requests without a valid JWT token are correctly handled.
Authorization Issues: Test with expired or invalid tokens.
Rate Limiting: Ensure the route handles rate
 */
router.get('/',
  passport.authenticate('jwt', { session: false }),
  controller.getUsers,
);

/**
 * Valid User ID: Ensure it returns details for a valid user ID.
Invalid User ID: Handle cases where the user ID does not exist or is not a valid integer.
Authorization: Test with valid and invalid JWT tokens.
Authorization Issues: Test with expired or invalid tokens.

 */
router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  controller.getUserWithId);

/**
 * Valid User Update: Ensure the user can successfully update their details.
Invalid User ID: Handle cases where the :id does not exist or is not a valid integer.
Unauthorized Update: Ensure users can only update their own details.
Profile Picture Upload: Test with valid and invalid image files, including size and format constraints.
Missing Fields: Handle cases where required fields are missing or invalid.
Authorization: Test with valid and invalid JWT tokens.
Authorization Issues: Test with expired or invalid tokens.
 */
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
