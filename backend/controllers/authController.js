const prisma = require("../db/prismaClient");

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
  logout,
  register,
}
