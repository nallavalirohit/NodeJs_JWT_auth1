const JWT = require("jsonwebtoken");
const createError = require("http-errors");

const client = require("./redis_client");
const { create } = require("../models/user.model");

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "15s",
        issuer: "espn.com",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (error, token) => {
        if (error) {
          console.log(error.message);
          return reject(createError.InternalServerError());
          // reject(error);
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(createError.Unauthorized());
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        // if(err.name === 'JsonWebTokenError'){
        //     return next(createError.Unauthorized());
        // }
        // else{
        //     return next(createError.Unauthorized(err.message));
        // }
        const errMessage =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(createError.Unauthorized(errMessage));
      }
      req.payload = payload;
      next();
    });
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "30s",
        issuer: "espn.com",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (error, token) => {
        if (error) {
          console.log(error.message);
          return reject(createError.InternalServerError());
        }
        try {
          client.SET(userId, token, { EX: 30 });
          resolve(token);
        } catch (error) {
          console.log(error);
          reject(createError.InternalServerError());
          return;
        }
      });
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, payload) => {
          if (err) return reject(createError.Unauthorized());
          const userId = payload.aud;
          try {
            const val = await client.GET(userId);
            if(refreshToken === val) return resolve(userId);
            reject(createError.Unauthorized());
          } catch (error) {
            console.log(error);
            reject(createError.InternalServerError());
            return;
          }
        }
      );
    });
  },
};
