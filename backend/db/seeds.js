const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Clearing old data...');

  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Old data cleared.');

  // Reset ID sequences
  console.log('Resetting ID sequences...');

  if (prisma.$executeRaw) {
    // PostgreSQL specific commands
    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Like_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Follow_id_seq" RESTART WITH 1;`;
  } else {
    // MySQL specific commands
    await prisma.$executeRaw`ALTER TABLE User AUTO_INCREMENT = 1;`;
    await prisma.$executeRaw`ALTER TABLE Post AUTO_INCREMENT = 1;`;
    await prisma.$executeRaw`ALTER TABLE Comment AUTO_INCREMENT = 1;`;
    await prisma.$executeRaw`ALTER TABLE \`Like\` AUTO_INCREMENT = 1;`;
    await prisma.$executeRaw`ALTER TABLE Follow AUTO_INCREMENT = 1;`;
  }

  console.log('ID sequences reset.');
}

async function createFakeUser() {
  return prisma.user.create({
    data: {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      profilePic: faker.image.avatar(),
    },
  });
}

async function createFakePost(authorId) {
  return prisma.post.create({
    data: {
      content: faker.lorem.paragraph(),
      authorId,
    },
  });
}

async function createFakeComment(authorId, postId) {
  return prisma.comment.create({
    data: {
      content: faker.lorem.sentence(),
      authorId,
      postId,
    },
  });
}

async function createFakeLike(userId, postId) {
  // Check if the like already exists
  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  // If it doesn't exist, create it
  if (!existingLike) {
    return prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  }
  // If it already exists, return null or handle accordingly
  return null;
}

async function createFakeFollow(followerId, followedId) {
  return prisma.follow.create({
    data: {
      followerId,
      followedId,
    },
  });
}

async function seed() {
  // Clear old data and reset sequences
  await clearDatabase();

  console.log('Seeding database with fake data...');

  // Create Users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await createFakeUser();
    users.push(user);
  }

  // Create Posts and Comments for each user
  for (const user of users) {
    const post = await createFakePost(user.id);

    // Create some comments on each post
    for (let j = 0; j < 3; j++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      await createFakeComment(randomUser.id, post.id);
    }

    // Create some likes on each post
    const likedUsers = new Set(); // Track users who have already liked the post
    for (let k = 0; k < 3; k++) {
      let randomUser;
      do {
        randomUser = users[Math.floor(Math.random() * users.length)];
      } while (likedUsers.has(randomUser.id)); // Ensure the user hasn't liked the post yet

      await createFakeLike(randomUser.id, post.id);
      likedUsers.add(randomUser.id); // Add user to the set
    }
  }

  // Create follow relationships
  for (const user of users) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    if (user.id !== randomUser.id) {
      await createFakeFollow(user.id, randomUser.id);
    }
  }

  console.log('Seeding completed.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });