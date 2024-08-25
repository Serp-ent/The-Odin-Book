const prisma = require("../db/prismaClient");

const login = async (req, res, next) => {
  console.log(req.body)
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  console.log(user)

  const isMatch = password === user.password;
  if (!isMatch) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  res.json({
    status: 'success',
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
