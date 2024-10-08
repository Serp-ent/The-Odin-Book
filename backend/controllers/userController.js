const prisma = require("../db/prismaClient");
const asyncHandler = require('express-async-handler');

const updateUserWithId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params; // Assuming userId is passed as a URL parameter
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      profilePic,
      bio
    } = req.body;

    // Check if profilePic is undefined, then use the old one
    const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id, 10) } });

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id, 10) }, // Ensure userId is an integer
      data: {
        email,
        firstName,
        lastName,
        username,
        profilePic,
        bio,
        profilePic: req.file ? req.file.filename : existingUser.profilePic,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePic: true,
        bio: true,
        registeredAt: true,
        updatedAt: true,
      }
    });

    // Respond with a success message and updated user data
    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

const getUserWithId = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      email: true,
      lastName: true,
      profilePic: true,
      registeredAt: true,
      username: true,
      bio: true,
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isFollowed = req.user ? await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: req.user.id,
        followedId: user.id,
      }
    }
  }) !== null : false;

  const followerCount = await prisma.follow.count({
    where: {
      followedId: user.id,
    }
  });

  const followedCount = await prisma.follow.count({
    where: {
      followerId: user.id,
    }
  });

  res.json({
    ...user,
    isFollowed,
    followerCount,
    followedCount,
  });
})

const getFollowedUsers = asyncHandler(async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    // Fetch all users that the logged-in user is following
    const following = await prisma.follow.findMany({
      where: { followerId: loggedInUserId },
      include: {
        followed: {
          select: {
            id: true,
            firstName: true,
            username: true,
            lastName: true,
            email: true,
            profilePic: true,

            followedBy: {
              where: { followerId: loggedInUserId },
              select: {
                id: true,
              },
            },
          }
        }
      }
    });

    const followedUsers = following.map(follow => ({
      ...follow.followed,
      isFollowed: follow.followed.followedBy.length > 0,
    }));

    res.json(followedUsers);
  } catch (error) {
    console.error('Error fetching followed users:', error);
    res.status(500).json({ error: 'An error occurred while fetching followed users' });
  }
})

const followUser = asyncHandler(async (req, res) => {
  const followerId = req.user.id; // ID of the user making the request
  const followedId = parseInt(req.params.id, 10);
  const wantsToFollow = req.body.follow; // Boolean indicating follow or unfollow

  try {
    // Check if the target user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: followedId }
    });

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (wantsToFollow) {
      // Follow the user
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followedId: {
            followerId,
            followedId
          }
        }
      });

      if (existingFollow) {
        return res.status(400).json({ error: 'Already following this user' });
      }

      await prisma.follow.create({
        data: {
          followerId,
          followedId
        }
      });

      const user = await prisma.user.findUnique({ where: { id: followedId } });
      user.isFollowed = true;
      delete user.password;

      return res.status(201).json(user);

    } else {
      // Unfollow the user
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followedId: {
            followerId,
            followedId
          }
        }
      });

      if (!existingFollow) {
        return res.status(400).json({ error: 'You are not following this user' });
      }

      await prisma.follow.delete({
        where: {
          id: existingFollow.id
        }
      });

      const user = await prisma.user.findUnique({ where: { id: followedId } });
      user.isFollowed = false;
      delete user.password;

      return res.status(200).json(user);
    }
  } catch (error) {
    console.error('Error processing follow/unfollow request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const getUsers = asyncHandler(async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const searchQuery = req.query.search || '';

    // Fetch all users along with checking if they are followed by the logged-in user
    const users = await prisma.user.findMany({
      where: {
        // Filter users based on search query
        OR: [
          {
            username: {
              contains: searchQuery, // Assuming users have a 'username' field
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            email: {
              contains: searchQuery, // Assuming users have an 'email' field
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            firstName: {
              contains: searchQuery, // Assuming users have an 'email' field
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            lastName: {
              contains: searchQuery, // Assuming users have an 'email' field
              mode: 'insensitive', // Case-insensitive search
            },
          },
        ],
      },
      include: {
        followedBy: {
          where: {
            followerId: loggedInUserId,
          },
          select: {
            id: true,  // Just include the id for checking purposes
          },
        },
      },
    });

    // Map over users to add the isFollowed field
    const usersWithFollowStatus = users.map(user => {
      return {
        ...user,
        isFollowed: user.followedBy.length > 0,
      };
    });

    res.json(usersWithFollowStatus);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});

const getPostOfUser = asyncHandler(async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.id; // Assuming you have the current user's ID from authentication middleware

    // Fetch posts of the user with images
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
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
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        },
        images: {
          select: {
            url: true, // Adjust based on your actual image model fields
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    // Enhance each post with additional data
    const enhancedPosts = await Promise.all(posts.map(async (post) => {
      // Count likes for the post
      const likeCount = post._count.likes;

      // Check if the current user follows the post's author
      const isFollowed = await prisma.follow.findUnique({
        where: {
          followerId_followedId: {
            followerId: currentUserId,
            followedId: post.authorId
          }
        }
      }) !== null;

      // Check if the current user has liked the post
      const isLiked = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: currentUserId
          }
        }
      }) !== null;

      // Count comments for the post
      const commentsCount = post._count.comments;

      // Remove unnecessary fields
      delete post.authorId;
      delete post._count;

      return {
        ...post,
        likes: likeCount,
        isLiked: isLiked,
        author: {
          ...post.author,
          isFollowed: isFollowed,
        },
        commentsCount: commentsCount,
        images: post.images.map(image => image.url), // Include images
      };
    }));

    res.json({
      posts: enhancedPosts
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

module.exports = {
  getUserWithId,
  getFollowedUsers,
  followUser,
  getPostOfUser,
  getUsers,
  updateUserWithId,
}