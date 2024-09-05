const prisma = require("../db/prismaClient");
const jwt = require('jsonwebtoken');
const upload = require('../config/multer-config');

require('dotenv').config();

const secretKey = process.env.JWT_SECRET_KEY;

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  const isMatch = user.password === password;
  if (!isMatch) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  // TODO: hash password
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

    try {
      // Create a new user in the database
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password, // Ensure you hash the password before storing it in a production app
          firstName,
          lastName,
          profilePic, // URL for profile picture
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
