const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        console.error('[generateToken] ❌ CRITICAL: JWT_SECRET is not set in environment variables!');
        throw new Error('Server configuration error: JWT_SECRET is missing.');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '90d',
    });
};

module.exports = generateToken;
