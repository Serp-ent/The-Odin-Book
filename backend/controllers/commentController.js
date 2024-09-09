const prisma = require('../db/prismaClient');
const asyncHandler = require('express-async-handler');
const { ensureResourceAuthor } = require('./authController');

const deleteComment = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);

  // find post where this comment is
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      post: true,
    }
  });
  if (comment.post.authorId !== req.user.id
    && comment.authorId !== req.user.id) {
    res.status(403).json('Forbidden');
    return;
  }

  await prisma.comment.delete({ where: { id: comment.id } });

  res.json({ message: "Comment deleted successfully", comment });
});

const ensureCommentIdIsInteger = (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) {
    res.status(400).json({ message: "Comment id not an integer" });
    return;
  }

  req.commentId = parseInt(req.params.id);

  next();
}

const getCommentAuthorId = asyncHandler(async (req) => {
  const comment = await prisma.comment.findUnique({
    where: { id: req.commentId },
    select: {
      authorId: true
    }
  })

  if (!comment) {
    throw new Error('Comment not found');
  }

  return comment.authorId;
});

checkCommentExist = asyncHandler(async (req, res, next) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: req.commentId
    }
  });

  if (!comment) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }

  next();
});

const deleteCommentChain = [
  ensureCommentIdIsInteger,
  checkCommentExist,
  ensureResourceAuthor(getCommentAuthorId),
  deleteComment,
];

module.exports = {
  deleteCommentChain,
}
