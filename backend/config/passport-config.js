const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const prisma = require('../db/prismaClient');

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return done(null, false);
    }

    // TODO: add password hashing
    const isMatch = password === user.password;
    if (!isMatch) {
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: id })

    done(null, user);
  } catch (err) {
    done(err);
  }
})

module.exports = passport;