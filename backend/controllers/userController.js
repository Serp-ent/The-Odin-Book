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

module.exports = {
  getUserWithId,
}