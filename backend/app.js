var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const passport = require('./config/passport-config.js');

const authRouter = require('./routes/authRouter.js');
const postRouter = require('./routes/postRouter.js');
const userRouter = require('./routes/userRouter.js');
const commentRouter = require('./routes/commentRouter.js');
const errorHandler = require('./errors/errorHandler.js');

var app = express();

app.use(logger('dev'));
app.use(cors());

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);
app.use('/api/comments', commentRouter);

app.use(errorHandler);

module.exports = app;
