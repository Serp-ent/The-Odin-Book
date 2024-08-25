const login = (req, res, next) => {
  res.json({
    message: 'login',
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
