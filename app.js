const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
require('dotenv').config();
require('./helpers/mongoDB_connect')

const authRoute = require('./Routes/auth.routes');
const { verifyAccessToken } = require('./helpers/jwt_generator');

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}))

const PORT = process.env.PORT || 3000;

app.get('/', verifyAccessToken, async(req, res, next)=>{
    // console.log(req.headers['authorization']);
    console.log(req.payload);
    res.send('Hello from express');
});

app.use('/auth', authRoute);

app.use(async(req, res, next)=>{
    // const error = new Error('Not Found');
    // error.status = 404;
    // next(error);

    next(createError.NotFound());
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status,
            message: err.message
        }
    })
});

app.listen(PORT, ()=>{
    console.log(`Server running on port: ${PORT}`);
})