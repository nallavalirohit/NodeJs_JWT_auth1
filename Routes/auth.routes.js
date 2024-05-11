const express = require('express');

const router = express.Router();
const createError = require('http-errors');
const User = require('../models/user.model');
const {authSchema} = require('../helpers/validation_schema');
const {signAccessToken, signRefreshToken, verifyRefreshToken} = require('../helpers/jwt_generator');

router.post('/register', async(req, res, next)=> {
    try {
        // const {email, password} = req.body;
        // console.log(req.body);
        // if(!email || !password) throw createError.BadRequest();
        const result = await authSchema.validateAsync(req.body);
        console.log(result);

        const userExist = await User.findOne({email: result.email});
        if(userExist) throw createError.Conflict(`${result.email} has already registered!`);

        const newUser = new User(result);
        const saveNewUser = await newUser.save();

        const accessToken = await signAccessToken(saveNewUser.id);
        const refreshToken = await signRefreshToken(saveNewUser.id);
        res.send({accessToken, refreshToken});

    } catch (error) {
        if(error.isJoi === true) error.status = 422;
        next(error);
    }
});

router.post('/login', async(req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body);
        const user = await User.findOne({email: result.email});

        if(!user) throw createError.NotFound("User is not registered!");

        const isMatch = await user.isValidPassword(result.password);
        if(!isMatch) throw createError.Unauthorized("Username/Password doesn't match!");

        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);
        res.send({accessToken, refreshToken});
    } catch (error) {
        if(error.isJoi) return next(createError.BadRequest("Invalid username/password!"));
        next(error);
    }
});

router.post('/refresh-token', async(req, res, next) => {
    try {
        const {refreshToken} = req.body;
        if(!refreshToken) throw createError.BadRequest();
        const userId = await verifyRefreshToken(refreshToken);

        const accessToken = await signAccessToken(userId);
        const refToken = await signRefreshToken(userId);
        res.send({accessToken:accessToken, refreshToken: refToken});
    } catch (error) {
        next(error);
    }
});

router.delete('/logout', async(req, res, next) => {
    res.send('Logout route');
});


module.exports = router;