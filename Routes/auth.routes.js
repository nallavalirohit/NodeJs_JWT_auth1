const express = require('express');

const router = express.Router();
const createError = require('http-errors');
const User = require('../models/user.model');
const {authSchema} = require('../helpers/validation_schema');

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
        res.send(saveNewUser);

    } catch (error) {
        if(error.isJoi === true) error.status = 422;
        next(error);
    }
});

router.post('/login', async(req, res, next) => {
    res.send('Login route');
});

router.post('/refresh-token', async(req, res, next) => {
    res.send('Refresh-Token route');
});

router.delete('/logout', async(req, res, next) => {
    res.send('Logout route');
});


module.exports = router;