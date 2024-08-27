const prisma = require("../db/prismaClient");

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

  res.json(user);
}

// TODO: add error handling
const getFollowedUsers = async (req, res) => {
  const following = await prisma.follow.findMany({
    where: { followerId: req.user.id },
    include: {
      followed: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    }
  });

  const followedUsers = following.map(follow => follow.followed);
  res.json(followedUsers);
}

module.exports = {
  getUserWithId,
  getFollowedUsers,
}