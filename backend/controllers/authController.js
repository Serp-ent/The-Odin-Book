const prisma = require("../db/prismaClient");
const jwt = require('jsonwebtoken');
const upload = require('../config/multer-config');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const secretKey = process.env.JWT_SECRET_KEY;

// TODO: handle empty body request
const login = async (req, res) => {
  const { username, password } = req.body;

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
}

const logout = (req, res, next) => {
  res.json({
    message: 'logout',
  });
}

// TODO: create user
// TODO: validation
// TODO: handle errors
const register = [
  upload.single('profilePic'),
  async (req, res, next) => {
    const { username, email, password, firstName, lastName, passwordConfirm } = req.body;
    const profilePic = req.file ? req.file.filename : null;
    console.log(profilePic);

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
  }
]

module.exports = {
  login,
  logout,
  register,
}
