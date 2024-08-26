const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const prisma = require('../db/prismaClient');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET_KEY;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
}

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: jwt_payload.id } });
    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
})
);

module.exports = passport;