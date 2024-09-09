const app = require('../app');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const prisma = require('../db/prismaClient');

describe('Posts Router', () => {
  let authToken;
  let userId;
  let otherUserId;
  let postId;

  beforeAll(async () => {
    // Create a user and get an authentication token
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'testuser@example.com',
        password: bcrypt.hashSync('password123', 10),
        firstName: 'Test',
        lastName: 'User',
      },
    });
    userId = user.id;

    const loginResponse = await request(app)
      .post('/login') // Adjust path if necessary
      .send({
        username: 'testuser',
        password: 'password123',
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
        lastName: 'User',
      },
    });
    otherUserId = otherUser.id;
  });

  afterAll(async () => {
    await prisma.comment.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.follow.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('GET /api/posts - should get all posts', async () => {
    // Create a post
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: 'Test post content',
      },
    });
    postId = post.id;

    const response = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.posts).toHaveLength(1);
    expect(response.body.posts[0]).toHaveProperty('content', 'Test post content');

    // cleanup - remove that post
    await prisma.post.delete({ where: { id: post.id } });
  });

  it('GET /api/posts/followed - should get followed users\' posts', async () => {
    // Follow another user
    await prisma.follow.create({
      data: {
        followerId: userId,
        followedId: otherUserId,
      },
    });

    // Create a post by the followed user
    await prisma.post.create({
      data: {
        authorId: otherUserId,
        content: 'Other user post content',
      },
    });

    const response = await request(app)
      .get('/api/posts/followed')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.posts).toHaveLength(1);
    expect(response.body.posts[0]).toHaveProperty('content', 'Other user post content');

    // Remove follow
    await prisma.follow.delete({
      where: {
        followerId_followedId: {
          followerId: userId,
          followedId: otherUserId,
        },
      },
    });
  });

  it('POST /api/posts/:id/like - should like a post', async () => {
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: 'Test post content',
      },
    });

    const response = await request(app)
      .post(`/api/posts/${post.id}/like`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ like: true })
      .expect(201);

    // TODO: it should return isLiked boolean flag
    // expect(response.body).toHaveProperty('isLiked', true);
    expect(response.body).toHaveProperty('likesCount', 1);
    expect(response.body).toHaveProperty('message', 'Post liked');
    expect(response.body).toHaveProperty('postId', post.id);
  });

  it('GET /api/posts/:id/comments - should get comments of a post', async () => {
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: 'Test post content',
      },
    });
    // Create a comment
    await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: userId,
        content: 'This is a test comment',
      },
    });

    const response = await request(app)
      .get(`/api/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.comments).toHaveLength(1);
    expect(response.body.comments[0]).toHaveProperty('content', 'This is a test comment');
  });

  it('POST /api/posts/:id/comments - should create a comment on a post', async () => {
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: 'Test post content',
      },
    });

    const response = await request(app)
      .post(`/api/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Another comment' })
      .expect(201);

    expect(response.body).toHaveProperty('content', 'Another comment');
    expect(response.body).toHaveProperty('postId', post.id);
    expect(response.body).toHaveProperty('author', expect.objectContaining({ id: userId }));
  });

  it('GET /api/posts/:id - should get a post by ID', async () => {
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: 'Test post content',
      },
    });

    const response = await request(app)
      .get(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', post.id);
    expect(response.body).toHaveProperty('content', 'Test post content');
    expect(response.body).toHaveProperty('authorId', userId);
  });
});