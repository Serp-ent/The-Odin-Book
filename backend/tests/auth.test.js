const express = require('express');
const request = require('supertest');
const app = express();
const auth = require('../controllers/authController');
const multer = require('multer');
const prisma = require('../db/prismaClient');
const bcrypt = require('bcryptjs');

app.use(express.json());
app.use(multer().single('profilePic')); // Mock multer middleware

app.post('/register', ...auth.register);

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.user.deleteMany();
});

describe('POST /register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.username).toBe('testuser');
    expect(response.body.user.email).toBe('testuser@example.com');
  });

  it('should return validation errors for invalid input', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: '', // Invalid username
        email: 'invalid-email',
        password: 'short', // Too short
        firstName: '',
        lastName: ''
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ msg: 'Username is required' })
    );
  });
});