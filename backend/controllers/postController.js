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
          // Check if the current user follows the author
          followedBy: {
            where: {
              followerId: req.user.id,
            },
            select: {
              id: true,
            },
          },
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

  // Flatten the structure and add the isLiked and isFollowed properties
  const adjustedPosts = posts.map(post => ({
    ...post,
    // Whether the current user liked the post
    isLiked: post.likes.length > 0,
    likes: post._count.likes, // Number of likes
    // Whether the current user follows the author
    author: {
      ...post.author,
      isFollowed: post.author.followedBy.length > 0,
    },
  }));

  // Clean up the response by removing unnecessary properties
  adjustedPosts.forEach(post => {
    delete post['_count'];
    delete post.author['followedBy'];
  });

  res.json({
    status: 'success',
    posts: adjustedPosts,
    totalPages,
    page,
  });
};

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

    // Flatten the structure and add the isLiked property
    const flattenPost = {
      ...post,
      // WARNING: the order is important
      // TODO: add if is liked
      // isLiked: post.likes.length > 0, // Whether the current user liked the post
      likes: post._count.likes, // Number of likes
    };

    // Clean up the response by removing unnecessary properties
    delete flattenPost['_count'];  // duplicate
    delete flattenPost['authorId'];  // already in author object

    res.json(flattenPost);
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
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request body. Expecting a boolean "like" property.',
    });
  }

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
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
        return res.status(400).json({
          status: 'error',
          message: 'You have already liked this post.',
        });
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

      // Optionally get the updated like count
      const updatedPost = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      return res.status(201).json({
        status: 'success',
        message: 'Post liked',
        postId,
        likesCount: updatedPost._count.likes, // Include updated like count
      });
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
        return res.status(400).json({
          status: 'error',
          message: 'You have not liked this post yet.',
        });
      }

      // Delete the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Optionally get the updated like count
      const updatedPost = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      return res.status(200).json({
        status: 'success',
        message: 'Post unliked',
        postId,
        likesCount: updatedPost._count.likes, // Include updated like count
      });
    }
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

const createPost = async (req, res) => {
  const { content } = req.body;
  // TODO: add validation for empty posts
  const post = await prisma.post.create({
    data: {
      content: content,
      authorId: req.user.id,
    }
  });

  res.json(post);
}

// TODO: error handling
const createComment = async (req, res) => {
  const { content } = req.body;
  const postId = parseInt(req.params.id)

  const post = await prisma.comment.create({
    data: {
      authorId: req.user.id,
      postId,
      content,
    }
  });

  res.json(post);
}

module.exports = {
  getPosts,
  getPostWithId,
  likePost,
  createPost,
  createComment,
};