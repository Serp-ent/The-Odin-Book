var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport-config.js');

var indexRouter = require('./routes/index');
const authRouter = require('./routes/authRouter.js');

var app = express();

app.use(logger('dev'));
app.use(cors());
app.use(session({
  secret: "TODO: get from env",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // TODO: set true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', authRouter);

module.exports = app;
