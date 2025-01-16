require('dotenv').config({ path: `${process.cwd()}/.env` });
const express = require('express');

const authRouter = require('./route/authRoute');
const catchAsync = require('./utils/catchAsync');
const gateRouter = require('./route/gateRoute');
const shareRouter = require('./route/shareRoute');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());

// all routes will be here
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/gate', gateRouter);
app.use('/api/v1/share', shareRouter);

app.use(
    '*',
    catchAsync(async (req, res, next) => {
        res.render('notfound', { url: req.originalUrl});
    })
);

app.use(globalErrorHandler);

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, () => {
    console.log('Server up and running', PORT);
});
