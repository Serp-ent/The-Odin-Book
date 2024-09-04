const prisma = require("../db/prismaClient");

const getFollowedPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;

  // Get the IDs of the users that the current user follows
  const followedUserIds = await prisma.follow.findMany({
    where: {
      followerId: req.user.id,
    },
    select: {
      followedId: true,
    },
  }).then(followedUsers => followedUsers.map(follow => follow.followedId));

  // Add the current user ID to the list of user IDs
  const userIds = [...followedUserIds, req.user.id];

  // If no users, return an empty result
  if (userIds.length === 0) {
    return res.json({
      status: 'success',
      posts: [],
      totalPages: 0,
      page,
    });
  }

  // Get the total number of posts from followed users and the current user
  const totalPosts = await prisma.post.count({
    where: {
      authorId: { in: userIds },
    },
  });

  // Fetch posts from followed users and the current user
  const posts = await prisma.post.findMany({
    where: {
      authorId: { in: userIds },
    },
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
          comments: true,
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
    orderBy: {
      createdAt: 'desc', // Order by creation date, newest first
    },
  });

  const totalPages = Math.ceil(totalPosts / limit);

  // Flatten the structure and add the isLiked and isFollowed properties
  const adjustedPosts = posts.map(post => ({
    ...post,
    // Whether the current user liked the post
    isLiked: post.likes.length > 0,
    commentsCount: post._count.comments,
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
    delete post.authorId;
  });

  res.json({
    status: 'success',
    posts: adjustedPosts,
    totalPages,
    page,
  });
}

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
          comments: true,
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
    commentsCount: post._count.comments,
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
    delete post.authorId;
  });

  res.json({
    status: 'success',
    posts: adjustedPosts,
    totalPages,
    page,
  });
};

// TODO: add async handler
// TODO: add information if user is followed
const getPostWithId = async (req, res) => {
  const id = parseInt(req.params.id);
  const currentUserId = parseInt(req.user.id); // Assuming you have the current user ID available in the request (e.g., through middleware)

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
            followedBy: {
              where: { followerId: currentUserId },
              select: {
                id: true, // We just need to check if a record exists
              }
            },
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
        likes: {
          where: {
            userId: currentUserId,
          },
          select: {
            id: true, // Check if the post is liked by the current user
          }
        },
        _count: {
          select: {
            likes: true, // Count the number of likes
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Flatten the structure and add the isFollowed, isLiked, and likes properties
    const flattenPost = {
      ...post,
      likes: post._count.likes, // Total number of likes
      commentsCount: post._count.comments,
      isLiked: post.likes.length > 0, // Determine if the current user liked the post
      author: {
        ...post.author,
        isFollowed: post.author.followedBy.length > 0, // Determine if the current user follows the author
      },
    };


    // Clean up the response by removing unnecessary properties
    delete flattenPost['_count'];  // Remove duplicate
    delete flattenPost['author'].followedBy; // Remove the followedBy field

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

const getComments = async (req, res) => {
  const postId = parseInt(req.params.id);
  const limit = parseInt(req.query.limit) || 10; // Default limit to 10
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const sort = req.query.sort || 'newest'; // Default sort is 'newest'
  const userId = req.user.id; // Assuming user ID is available in req.user

  // Validate limit and page number
  if (limit <= 0 || page <= 0) {
    return res.status(400).json({ error: 'Invalid limit or page number' });
  }

  // Determine sorting order
  const orderBy = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  try {
    // Fetch comments with pagination and sorting
    const comments = await prisma.comment.findMany({
      where: { postId },
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
          }
        }
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: orderBy,
    });

    // Fetch the total number of comments for the post
    const totalComments = await prisma.comment.count({
      where: { postId },
    });

    // Determine if there are more pages
    const hasNextPage = page * limit < totalComments;
    const nextPage = hasNextPage ? page + 1 : null;

    // Fetch follow status for each comment author
    const followStatus = await prisma.follow.findMany({
      where: {
        followerId: userId,
        followedId: {
          in: comments.map(comment => comment.authorId),
        }
      },
      select: {
        followedId: true
      }
    });

    // Create a Set of followed user IDs for quick lookup
    const followedUserIds = new Set(followStatus.map(follow => follow.followedId));

    // Add isFollowed property to each comment author
    const commentsWithFollowStatus = comments.map(comment => ({
      ...comment,
      author: {
        ...comment.author,
        isFollowed: followedUserIds.has(comment.author.id),
      }
    }));

    // Respond with comments and pagination info
    res.json({
      comments: commentsWithFollowStatus,
      nextPage,
      hasNextPage,
      currentPage: page,
      totalComments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};


// TODO: error handling
const createComment = async (req, res) => {
  const { content } = req.body;
  const postId = parseInt(req.params.id)

  const post = await prisma.comment.create({
    data: {
      authorId: req.user.id,
      postId,
      content,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          profilePic: true,
          registeredAt: true,
        }
      }
    }
  });

  const isFollowed = await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: req.user.id,
        followedId: post.author.id,
      }
    }
  });

  delete post.authorId;

  res.json({
    ...post,
    author: {
      ...post.author,
      isFollowed: (isFollowed != null)
    },
  });
}

module.exports = {
  getPosts,
  getPostWithId,
  likePost,
  createPost,
  createComment,
  getComments,
  getFollowedPosts,
};