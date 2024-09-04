const prisma = require('../db/prismaClient');

// TODO: handle errors
// TODO: check authorization
const deleteComment = async (req, res) => {
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

  res.json({ message: "Comment was deleted", comment });
}

module.exports = {
  deleteComment,
}