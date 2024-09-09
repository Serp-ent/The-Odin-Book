const prisma = require("../db/prismaClient");
const jwt = require('jsonwebtoken');
const upload = require('../config/multer-config');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

require('dotenv').config();

const secretKey = process.env.JWT_SECRET_KEY;

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1d' });
  res.json({
    message: 'logged in',
    token,
  });
});

const logout = (req, res, next) => {
  res.json({
    message: 'logout',
  });
}

const validateRegister = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    .isLength({ max: 32 }).withMessage('Username must be at most 32 characters long'),

  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email must be at most 255 characters long'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('firstName')
    .optional()
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),

  body('lastName')
    .optional()
    .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
}

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;
  const profilePic = req.file ? req.file.filename : null;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        profilePic,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

const ensureEmailAndUserNameFree = asyncHandler(async (req, res, next) => {
  const { username, email } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ]
    }
  })

  if (user) {
    const usedCredential = user.username === username ? 'Username' : 'Email';
    const msg = usedCredential + ' already in use';
    res.status(409).json({
      errors: [{ msg }]
    });
    return;
  }

  next();
})

const registerChain = [
  upload.single('profilePic'),
  validateRegister,
  handleValidationErrors,
  ensureEmailAndUserNameFree,
  registerUser,
]

module.exports = {
  login,
  logout,
  registerChain,
}
