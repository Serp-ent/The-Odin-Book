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
        },
      },
      _count: {
        select: {
          likes: true, // Get the total number of likes
        }
      },
      // Check if the current user has liked the post
      likes: {
        where: {
          userId: req.user.id,
        },
        select: {
          id: true,
        },
      },
    },
    skip: offset,
    take: limit,
  });

  const totalPages = Math.ceil(totalPosts / limit);

  // Flatten the structure and add the isLiked property
  const adjustedPosts = posts.map(post => ({
    ...post,
    // WARNING: the order is important
    isLiked: post.likes.length > 0, // Whether the current user liked the post
    likes: post._count.likes, // Number of likes
  }));

  // Clean up the response by removing unnecessary properties
  adjustedPosts.forEach(post => {
    delete post['_count'];
  });

  res.json({
    status: 'success',
    posts: adjustedPosts,
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

const likePost = async (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.id;
  const { like } = req.body;

  if (typeof like !== 'boolean') {
    return res.status(400).json({ message: 'Invalid request body. Expecting a boolean "like" property.' });
  }

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (like) {
      // If the user wants to like the post
      const existingLike = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: postId,
            userId: userId,
          },
        },
      });

      if (existingLike) {
        return res.status(400).json({ message: 'You have already liked this post.' });
      }

      // Create a new like
      await prisma.like.create({
        data: {
          post: {
            connect: { id: postId },
          },
          user: {
            connect: { id: userId },
          },
        },
      });
      return res.status(201).json({ message: 'Post liked' });
    } else {
      // If the user wants to unlike the post
      const existingLike = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: postId,
            userId: userId,
          },
        },
      });

      if (!existingLike) {
        return res.status(400).json({ message: 'You have not liked this post yet.' });
      }

      // Delete the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return res.status(200).json({ message: 'Post unliked' });
    }
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getPosts,
  getPostWithId,
  likePost,
};