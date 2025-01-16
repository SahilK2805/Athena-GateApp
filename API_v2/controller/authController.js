// const User = require('../db/models/user');
const {User} = require('../config/exporting');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const signup = catchAsync(async (req, res, next) => {
    const body = req.body;
    
    const newUser = await User.create({
        userType: body.userType,
        name: body.firstName,
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
    });

    if (!newUser) {
        console.log('Failed to create the user');
        return next(new AppError('Failed to create the user', 400));
    }

    const result = newUser.toJSON();
    delete result.password;
    delete result.deletedAt;

    result.token = generateToken({
        id: result.id,
    });

    return res.status(201).json({
        status: 'success',
        data: result,
    });
});

const resetPassword = catchAsync(async (req, res, next) => {
    
    const { email, password, confirmPassword } = req.body;
    if (!password || !confirmPassword || !email) {
        console.log('Please provide password and confirmPassword');
        return next(
            new AppError('Please provide password and confirmPassword', 400)
        );
    }

    if (password !== confirmPassword) {
        console.log('Password and confirmPassword does not match');
        return next(
            new AppError('Password and confirmPassword does not match', 400)
        );
    }

    const result = await User.findOne({ where: { email } });
    if (!result) {
        console.log('User not found');
        return next(new AppError('User not found', 404));
    }

    result.password = password;
    result.confirmPassword = confirmPassword;
    await result.save();

    delete result.password;
    delete result.deletedAt;
    result.token = generateToken({
        id: result.id,
    });

    return res.json({
        status: 'success',
        data: result,
    });

});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email,password);
    if (!email || !password) {
        console.log('Please provide email and password');
        return next(new AppError('Please provide email and password', 400));
    }

    const result = await User.findOne({ where: { email } });
    if (!result || !(await bcrypt.compare(password, result.password))) {
        console.log('Incorrect email or password');
        return next(new AppError('Incorrect email or password', 401));
    }
    
    const token = generateToken({
        id: result.id,
    });
    console.log(result)
    console.log(result.id,token, result.userType);
    
    return res.json({
        status: 'success',
        id: result.id,
        userType: result.userType,
        token:token,
    });
});

const getUserdata = catchAsync(async (req, res, next) => {
    //console.log("me",res,req);
    body = req.body
    console.log
    try{
    const result = await User.findOne({ where: { email: body.emailid } });
    
    return res.json({
        status: 'success',
        oid: result.id,
    });

    }
    catch{
        return next(new AppError("Unable to find Account"));
    }
    
}
);

const getUserbyId = catchAsync(async (req, res, next) => {
    console.log(req.params)
    const result = await User.findOne({ where: { id: req.params.id } });
    if (!result) {
        console.log('User not found');
        return next(new AppError('User not found', 404));
    }
    //console.log(result);
    return res.json({
        status: 'success',
        data: result,
    });
});


const authentication = catchAsync(async (req, res, next) => {
    // 1. get the token from headers
    let idToken = '';
    console.log(req.headers);
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Bearer token
        idToken = req.headers.authorization.split(' ')[1];
    }
    if (!idToken) {
        console.log('Please login to get access');
        return next(new AppError('Please login to get access', 401));
    }
    // 2. token verification
    const tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET_KEY);

    // 3. get the user detail from db and add to req object
    const freshUser = await User.findByPk(tokenDetail.id);

    if (!freshUser) {
        console.log('User no longer exists');
        return next(new AppError('User no longer exists', 400));
    }
    req.user = freshUser;
    return next();
});

const restrictTo = (...userType) => {
    const checkPermission = (req, res, next) => {
        if (!userType.includes(req.user.userType)) {
            console.log(
                "You don't have permission to perform this action"
            );
            return next(
                new AppError(
                    "You don't have permission to perform this action",
                    403
                )
            );
        }
        return next();
    };

    return checkPermission;
};

module.exports = { signup, login,authentication, restrictTo, getUserdata, resetPassword, getUserbyId };
