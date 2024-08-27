const prisma = require("../db/prismaClient");

// TODO: add async handler
// TODO: add tests
const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

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

// TODO: add async handler
const getPostWithId = async (req, res) => {
  // TODO: handle incorrect id
  const id = parseInt(req.params.id);

  // TODO: include only first 10 comments
  try {
    const post = await prisma.post.findUnique({
      where: { id },
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
          },
        },
        comments: {
          take: 10, // Limit to the first 10 comments
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
              },
            },
          },
        },
        _count: {
          select: {
            likes: true, // Count the number of likes
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getPosts,
  getPostWithId,
};