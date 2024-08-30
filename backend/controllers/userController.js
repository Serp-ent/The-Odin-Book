const prisma = require("../db/prismaClient");

// TODO: make 2 paths if user authenticated return if its followed
const getUserWithId = async (req, res) => {
  // TODO: handle non int id
  const id = parseInt(req.params.id);

  // TODO: handle non existent user
  // TODO: write tests using supertest
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePic: true,
      registeredAt: true,
      username: true,
    }
  });

  const isFollowed = req.user ? await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: req.user.id,
        followedId: user.id,
      }
    }
  }) !== null : false;

  res.json({ ...user, isFollowed });
}

// TODO: add error handling
const getFollowedUsers = async (req, res) => {
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
}

// TODO: handle errors
const followUser = async (req, res) => {
  const followerId = req.user.id; // ID of the user making the request
  const followedId = parseInt(req.params.id, 10);
  const wantsToFollow = req.body.follow; // Boolean indicating follow or unfollow

  // TODO: handle following yourself

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

      return res.status(201).json({ message: 'User followed successfully' });

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

      return res.status(200).json({ message: 'User unfollowed successfully' });
    }
  } catch (error) {
    console.error('Error processing follow/unfollow request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// TODO: get info if user if followed based on req.user.id
// TODO: add pagination
const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    // Fetch all users along with checking if they are followed by the logged-in user
    const users = await prisma.user.findMany({
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
}

const getPostOfUser = async (req, res) => {
  // TODO: handle errors
  // TODO: add query parameters for sorting
  // TODO: add pagination
  const userId = parseInt(req.params.id);
  const posts = await prisma.post.findMany({
    where: { authorId: userId }
  });

  res.json(posts);

}

module.exports = {
  getUserWithId,
  getFollowedUsers,
  followUser,
  getPostOfUser,
  getUsers,
}