const prisma = require("../db/prismaClient");

// TODO: add async handler
// TODO: add tests
const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const offset = (page - 1) * limit;

  const totalPosts = await prisma.post.count();

  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          profilePic: true,
          registeredAt: true,
          updatedAt: true,
          // Exclude password by not selecting it
        },
      },
      _count: {
        select: {
          likes: true,
        }
      }
    },
    skip: offset,
    take: limit,
  });

  const totalPages = Math.ceil(totalPosts / limit);

  res.json({
    status: 'success',
    posts,
    totalPages,
    page,
  });
}

module.exports = {
  getPosts,
};