const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');
const passport = require('../config/passport-config');
const upload = require('../config/multer-config');

router.get('/',
  passport.authenticate('jwt', { session: false }),
  controller.getPosts);


/*
Empty Followed Posts: Ensure it handles cases where a user follows others but there are no posts.
No Follow Relationships: Handle scenarios where the user does not follow anyone.
Authorization: Test with valid and invalid tokens.
Authorization Issues: Test with expired or invalid tokens.
*/
router.get('/followed',
  passport.authenticate('jwt', { session: false }),
  controller.getFollowedPosts);

/*
Valid Post Creation: Ensure it successfully creates a post with valid data.
Invalid Data: Handle cases where the request is missing required fields or includes invalid data.
File Uploads: Test with zero, one, and up to the maximum number of images (12).
Authorization: Test with valid and invalid tokens.
Image Types and Sizes: Ensure that the server correctly handles different image formats and sizes.
Authorization Issues: Test with expired or invalid tokens.
 */
router.post('/',
  passport.authenticate('jwt', { session: false }),
  upload.array('images', 12),
  controller.createPost
);

/**
 * Valid Post ID: Ensure liking a valid post works as expected.
Invalid Post ID: Handle cases where the post ID does not exist or is not a valid integer.
Duplicate Likes: Ensure that the user cannot like the same post multiple times (if applicable).
Authorization: Test with valid and invalid tokens.
Authorization Issues: Test with expired or invalid tokens.
 */
router.post('/:id/like',
  passport.authenticate('jwt', { session: false }),
  controller.likePost);

/**
 * Valid Post ID: Ensure it returns comments for a valid post ID.
Invalid Post ID: Handle cases where the post ID does not exist or is not a valid integer.
Empty Comments: Ensure it correctly handles posts with no comments.
Authorization: Test with valid and invalid tokens.
Authorization Issues: Test with expired or invalid tokens.
 */
router.get('/:id/comments',
  passport.authenticate('jwt', { session: false }),
  controller.getComments,
)

/**
 * Valid Comment Creation: Ensure creating a comment on a valid post ID works as expected.
Invalid Post ID: Handle cases where the post ID does not exist or is not a valid integer.
Missing Comment Content: Ensure it handles cases where the comment content is missing or invalid.
Authorization: Test with valid and invalid tokens.
Authorization Issues: Test with expired or invalid tokens.
 */
router.post('/:id/comments',
  passport.authenticate('jwt', { session: false }),
  controller.createComment,
)

/**
 * Valid Post ID: Ensure it returns the correct post details for a valid post ID.
Invalid Post ID: Handle cases where the post ID does not exist or is not a valid integer.
Authorization: Test with valid and invalid tokens.
Authorization Issues: Test with expired or invalid tokens.
 */
router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  controller.getPostWithId);

module.exports = router;
