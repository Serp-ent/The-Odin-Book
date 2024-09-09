const app = require('../app');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const prisma = require('../db/prismaClient');

describe('Users Router', () => {
  let authToken;
  let userId;
  let otherUserId;

  beforeAll(async () => {
    // Create a user and get an authentication token
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'testuser@example.com',
        password: bcrypt.hashSync('password123', 10),
        firstName: 'Test',
        lastName: 'User'
      }
    });
    userId = user.id;

    const loginResponse = await request(app)
      .post('/login') // Adjust path if necessary
      .send({
        username: 'testuser',
        password: 'password123'
      })
      .expect(200);

    authToken = loginResponse.body.token;

    // Create another user for follow/unfollow tests
    const otherUser = await prisma.user.create({
      data: {
        username: 'otheruser',
        email: 'otheruser@example.com',
        password: bcrypt.hashSync('password123', 10),
        firstName: 'Other',
        lastName: 'User'
      }
    });
    otherUserId = otherUser.id;
  });

  afterAll(async () => {
    await prisma.follow.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('GET /api/users/followed - should get followed users', async () => {
    // TODO: users should be in array
    await prisma.follow.create({
      data: {
        followerId: userId,
        followedId: otherUserId
      }
    });

    const response = await request(app)
      .get('/api/users/followed')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('username', 'otheruser');


    // remove follow
    await prisma.follow.delete({
      where: {
        followerId_followedId: {
          followerId: userId,
          followedId: otherUserId
        }
      }
    });
  });

  // TODO: handle non-existent user
  // TODO: handle non numerical id
  // TODO: tests should be in transaction currently upper test have impact on this test result
  it('POST /api/users/:id/follow - should follow a user', async () => {
    const response = await request(app)
      .post(`/api/users/${otherUserId}/follow`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ follow: true })
      .expect(201);

    expect(response.body).toHaveProperty('isFollowed', true);
  });

  it('GET /api/users/:id/posts - should get posts of a user', async () => {
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: 'Test post content'
      }
    });

    const response = await request(app)
      .get(`/api/users/${userId}/posts`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.posts).toHaveLength(1);
    expect(response.body.posts[0]).toHaveProperty('content', 'Test post content');
  });

  it('GET /api/users/ - should get all users', async () => {
    const response = await request(app)
      .get('/api/users/')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveLength(2); // Adjust if more users are present
    expect(response.body[0]).toHaveProperty('username', 'testuser');
  });

  it('GET /api/users/:id - should get a user by ID', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', userId);
    expect(response.body).toHaveProperty('username', 'testuser');
  });

  it('PUT /api/users/:id - should update user details', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'newemail@example.com',
        firstName: 'NewFirstName',
        lastName: 'NewLastName',
        username: 'newusername',
        profilePic: 'newpic.jpg',
        bio: 'This is a new bio'
      })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'User updated successfully');
    expect(response.body.user).toHaveProperty('email', 'newemail@example.com');
  });

  it('PUT /api/users/:id - should return 403 if unauthorized', async () => {
    const otherToken = await request(app)
      .post('/api/login')
      .send({
        username: 'otheruser',
        password: 'password123'
      })
      .then(res => res.body.token);

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        email: 'newemail@example.com'
      })
      .expect(401);
  });
});