const JWT = require('jsonwebtoken');
const createError = require('http-errors');

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const options = {
                expiresIn: "15s",
                issuer: "espn.com",
                audience: userId
            };
            JWT.sign(payload, secret, options, (error, token)=> {
                if(error){
                    console.log(error.message);
                    return reject(createError.InternalServerError());
                    // reject(error);
                } 
                resolve(token);
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if(!req.headers['authorization']) return next(createError.Unauthorized());
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if(err) {
                // if(err.name === 'JsonWebTokenError'){
                //     return next(createError.Unauthorized());
                // }
                // else{
                //     return next(createError.Unauthorized(err.message));
                // }
                const errMessage = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
                return next(createError.Unauthorized(errMessage));
            }
            req.payload = payload;
            next();
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {};
            const secret = process.env.REFRESH_TOKEN_SECRET;
            const options = {
                expiresIn: '1d',
                issuer: 'espn.com',
                audience: userId
            }
            JWT.sign(payload, secret, options, (error, token) => {
                if(error){
                    console.log(error.message);
                    return reject(createError.InternalServerError());
                }
                resolve(token);
            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if(err) return reject(createError.Unauthorized());
                const userId = payload.aud;
                resolve(userId);
            })
        })
    }
}