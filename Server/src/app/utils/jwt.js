const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = {
    signAccessToken: (payload) => {
        return new Promise((resolve, reject) => {

            // Encode encrypted payload with secret key
            const secret = config.jwtSecret;
            if (!secret) {
                reject(new Error('No access token secret provided'));
            }
            const options = {
                // expires in 15 minutes
                expiresIn: '15m',
                issuer: 'localhost'
            };
            jwt.sign({ data: payload }, secret, options, (err, token) => {
                if (err) {
                    reject(err);
                }
                resolve(token);
            });
        });
    },

    verifyAccessToken: (token) => {
        return new Promise((resolve, reject) => {
            const secret = config.jwtSecret;
            if (!secret) {
                reject(new Error('No access token secret provided'));
            }
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded.data);
            });
        });
    }
    
};
