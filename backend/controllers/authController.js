const prisma = require("../db/prismaClient");
const jwt = require('jsonwebtoken');

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

const register = (req, res, next) => {
  res.json({
    message: 'register'
  });
}

module.exports = {
  login,
  logout,
  register,
}
