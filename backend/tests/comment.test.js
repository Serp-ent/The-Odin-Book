const app = require('../app');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const prisma = require('../db/prismaClient');

describe('Comment Router', () => {
  let authToken;
  let userId;
  let otherUserId;
  let postId;
  let commentId;

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

    // Create another user for additional tests
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

    // Create a post
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: 'Test post content',
      },
    });
    postId = post.id;
  });

  afterAll(async () => {
    await prisma.comment.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.follow.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('POST /api/posts/:id/comments - should create a comment on a post', async () => {
    const response = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'This is a test comment' })
      .expect(201);

    commentId = response.body.id;

    expect(response.body).toHaveProperty('content', 'This is a test comment');
    expect(response.body).toHaveProperty('postId', postId);
    expect(response.body).toHaveProperty('author', expect.objectContaining({ id: userId }));
  });

  it('DELETE /api/comments/:id - should delete a comment', async () => {
    // Delete the comment created in the previous test
    const response = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Comment deleted successfully');

    // Check if the comment was really deleted
    const deletedComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    expect(deletedComment).toBeNull();
  });

  it('DELETE /api/comments/:id - should return 403 if trying to delete another user\'s comment', async () => {
    // Create a new comment with a different user
    const otherComment = await prisma.comment.create({
      data: {
        postId: postId,
        authorId: otherUserId,
        content: 'This is another user\'s comment',
      },
    });

    const response = await request(app)
      .delete(`/api/comments/${otherComment.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403); // Expecting a "Forbidden" response

    expect(response.body).toHaveProperty('message', 'Unauthorized');

    // Clean up
    await prisma.comment.delete({ where: { id: otherComment.id } });
  });



  describe("DELETE /api/comments/:id - should return 400 for invalid id's comment", () => {
    it("Should return 400 for string id", async () => {
      const response = await request(app)
        .delete(`/api/comments/abc`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    })

    it("Should return 400 for string floating-point number", async () => {
      const response = await request(app)
        .delete(`/api/comments/12.34`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    })
  });

  it("Should return 404 for non-comment", async () => {
    const response = await request(app)
      .delete(`/api/comments/9999`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  })


  it("Should return 401 for unauthenticated user", async () => {
    const response = await request(app)
      .delete(`/api/comments/${postId}`)
      .expect(401);
  })
})