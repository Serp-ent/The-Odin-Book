const express = require('express');
const request = require('supertest');
const app = express();
const auth = require('../controllers/authController');
const multer = require('multer');
const prisma = require('../db/prismaClient');
const bcrypt = require('bcryptjs');

app.use(express.json());
app.use(multer().single('profilePic')); // Mock multer middleware

app.post('/register', ...auth.registerChain);
app.post('/login', auth.login);

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.user.deleteMany(); // Clean up the database before each test
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

  it('should return validation errors for missing fields', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ msg: 'Username is required' }),
      expect.objectContaining({ msg: 'Invalid email format' }),
      expect.objectContaining({ msg: 'Password is required' }),
      expect.objectContaining({ msg: 'Password must be at least 6 characters long' })
    ])
    );

  });

  it('should return an error if password and passwordConfirm do not match', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: 'password123',
        passwordConfirm: 'password1234',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ msg: 'Passwords do not match' })
    );
  });

  it('should not register a user with an already used email', async () => {
    // First registration
    await request(app).post('/register').send({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });

    // Try registering another user with the same email
    const response = await request(app).post('/register').send({
      username: 'anotheruser',
      email: 'testuser3@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });

    expect(response.status).toBe(409);
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ msg: 'Email already in use' })
    );
  });

  it('should return an error if the username is already in use', async () => {
    // First registration to use the username
    await request(app)
      .post('/register')
      .send({
        username: 'testuser4',
        email: 'testuser4@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

    // Second registration attempt with the same username
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser4',
        email: 'anotheremail@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(409);
    expect(response.body.errors).toEqual([
      expect.objectContaining({ msg: 'Username already in use' })
    ]);
  });

  it('should return validation errors for extremely long username and email', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'u'.repeat(256), // Extremely long username
        email: 'e'.repeat(256) + '@example.com', // Extremely long email
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ msg: 'Username must be at most 32 characters long' }),
      expect.objectContaining({ msg: 'Email must be at most 255 characters long' })
    ]));
  });

  it('should return validation errors for boundary password length', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'short', // Below minimum length
        passwordConfirm: 'short',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ msg: 'Password must be at least 6 characters long' })
    ]));
  });

});

describe('POST /login', () => {
  beforeAll(async () => {
    // Setup any necessary data or connections before tests
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up resources after tests
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.user.deleteMany();
  });

  it('should successfully log in a user with valid credentials', async () => {
    // Register a user first
    await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

    // Log in with the registered user
    const response = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('logged in');
    expect(response.body.token).toBeDefined();
  });

  it('should return an error for invalid username', async () => {
    // Attempt to log in with a non-existent username
    const response = await request(app)
      .post('/login')
      .send({
        username: 'invaliduser',
        password: 'password123'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('should return an error for invalid password', async () => {
    // Register a user first
    await request(app)
      .post('/register')
      .send({
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

    // Attempt to log in with the correct username but wrong password
    const response = await request(app)
      .post('/login')
      .send({
        username: 'testuser2',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('should return an error for missing fields', async () => {
    // Attempt to log in with missing fields
    const response = await request(app)
      .post('/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username and password are required');
  });
});