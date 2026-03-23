const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            if (token === 'null' || token === 'undefined') {
                console.error('[AUTH] ❌ Malformed token string received:', token);
                res.status(401);
                throw new Error('Session expired or invalid. Please log in again.');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('[AUTH] Decoded Token - User ID:', decoded.id);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.error('[AUTH] ❌ User not found for ID:', decoded.id, '— token is stale, force re-login required');
                res.status(401);
                throw new Error('User not found. Please log out and log back in.');
            }

            console.log('[AUTH] ✅ User authenticated:', req.user._id, req.user.email);
            next();
        } catch (error) {
            console.error('[AUTH] ❌ Middleware Error:', error.message);
            res.status(401);
            let message = error.message;
            if (message === 'jwt malformed') message = 'Invalid session format. Please log in again.';
            if (message === 'jwt expired') message = 'Session expired. Please log in again.';
            throw new Error(message || 'Not authorized');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin };
