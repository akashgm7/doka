const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Cart = require('../models/Cart');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
// @access  Private
const filterExpiredCartItems = (cart) => {
    if (!cart) return [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return cart.filter(item => {
        // If addedAt doesn't exist, we assume it's new and keep it
        if (!item.addedAt) return true;
        return new Date(item.addedAt) > oneDayAgo;
    });
};

const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.mobile = req.body.mobile || user.mobile;

        if (req.body.newPassword) {
            if (!req.body.oldPassword) {
                res.status(400);
                throw new Error('Please provide your current password to set a new one');
            }
            if (await user.matchPassword(req.body.oldPassword)) {
                user.password = req.body.newPassword;
            } else {
                res.status(401);
                throw new Error('Invalid current password');
            }
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            isAdmin: updatedUser.isAdmin,
            role: updatedUser.role,
            loyaltyPoints: updatedUser.loyaltyPoints,
            createdAt: updatedUser.createdAt,
            addresses: updatedUser.addresses,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        verificationToken,
    });

    if (user) {
        res.status(201).json({
            message: 'Registration successful!',
            _id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile || "",
            isAdmin: user.isAdmin,
            role: user.role,
            loyaltyPoints: user.loyaltyPoints || 0,
            addresses: user.addresses || [],
            token: generateToken(user.id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Verify email
// @route   GET /api/users/verifyemail/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    const user = await User.findOne({
        verificationToken: req.params.token,
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Email verified successfully! You can now log in.',
    });
});

// @desc    Forgot password
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(404);
        throw new Error('There is no user with that email');
    }

    // Get reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set reset token and expiry
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link below to reset your password: \n\n ${resetUrl}`;

    try {
        const success = await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message,
            html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
        });

        if (success) {
            res.status(200).json({ success: true, data: 'Email sent' });
        } else {
            res.status(500);
            throw new Error('Email could not be sent');
        }
    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        if (!res.headersSent) {
            res.status(500);
            throw new Error('Email could not be sent');
        }
    }
});

// @desc    Reset password
// @route   PUT /api/users/resetpassword/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        data: 'Password reset successful',
        token: generateToken(user._id),
    });
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Fetch cart from dedicated collection
        const cart = await Cart.findOne({ user: user.id });
        const filteredCart = cart ? filterExpiredCartItems(cart.items) : [];

        console.log('[LOGIN] ✅ Success! Returning data for:', user.email);
        const token = generateToken(user._id);
        console.log('[LOGIN] 🔑 Generated Token:', token ? '✅ Exists' : '❌ MISSING');

        res.json({
            _id: user.id || user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role,
            mobile: user.mobile,
            isVerified: user.isVerified,
            addresses: user.addresses,
            token: token,
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = { ...req.user._doc };

    // Fetch cart from dedicated collection
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        user.cart = filterExpiredCartItems(cart.items);
    } else {
        user.cart = [];
    }

    res.status(200).json(user);
});

// @desc    Add new address
// @route   POST /api/users/address
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const { label, addressLine, city, zipCode, coordinates } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        const newAddress = {
            label,
            addressLine,
            city,
            zipCode,
            coordinates,
            isDefault: (user.addresses && user.addresses.length === 0) || !user.addresses,
        };

        if (!user.addresses) {
            user.addresses = [];
        }

        user.addresses.push(newAddress);
        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            isAdmin: updatedUser.isAdmin,
            role: updatedUser.role,
            loyaltyPoints: updatedUser.loyaltyPoints || 0,
            createdAt: updatedUser.createdAt,
            addresses: updatedUser.addresses,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user address
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        if (user.addresses) {
            user.addresses = user.addresses.filter(
                (address) => address._id.toString() !== req.params.id
            );
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            isAdmin: updatedUser.isAdmin,
            role: updatedUser.role,
            loyaltyPoints: updatedUser.loyaltyPoints || 0,
            createdAt: updatedUser.createdAt,
            addresses: updatedUser.addresses,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Toggle a cake in user favorites (add if absent, remove if present)
// @route   POST /api/users/favorites/:cakeId
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
    const { cakeId } = req.params;
    const mongoose = require('mongoose');

    // Validate that this is a proper MongoDB ObjectId before proceeding
    if (!mongoose.Types.ObjectId.isValid(cakeId)) {
        res.status(400);
        throw new Error(`Invalid cake ID: "${cakeId}". Cannot add to favorites.`);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!user.favorites) user.favorites = [];

    const objectId = new mongoose.Types.ObjectId(cakeId);
    const isFav = user.favorites.some(id => id.equals(objectId));

    if (isFav) {
        user.favorites = user.favorites.filter(id => !id.equals(objectId));
    } else {
        user.favorites.push(objectId);
    }

    await user.save();
    // Return the updated favorites list as strings for easy frontend use
    res.json({ favorites: user.favorites.map(id => id.toString()) });
});

// @desc    Get user favorites list
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('favorites');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json({ favorites: (user.favorites || []).map(id => id.toString()) });
});


// @desc    Sync user cart
// @route   PUT /api/users/cart
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
    const { cartItems: incomingItems = [] } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    // Ensure we have arrays
    const existingItems = cart ? cart.items : [];

    // --- Order validation logic ---
    let orderType = null;
    let hasMMC = false;
    let hasReadyMade = false;

    // Check all items (incoming) to determine if this is a mixed cart
    incomingItems.forEach(item => {
        const isMMCItem = item.isMMC || (item.product && String(item.product).startsWith('mmc-'));
        if (isMMCItem) hasMMC = true;
        else hasReadyMade = true;
    });

    if (hasMMC && hasReadyMade) {
        res.status(400);
        throw new Error("Custom cakes and ready-made cakes cannot be ordered together. Please place separate orders.");
    }

    if (hasMMC) {
        orderType = 'MMC';
    } else if (hasReadyMade) {
        orderType = 'READY_MADE';
    }

    // MERGE LOGIC:
    // 1. Items in incomingItems are mapped (preserving timestamps if they exist)
    // 2. Items in existingItems NOT in incomingItems are also kept
    const mergedItems = [...incomingItems];

    // Adjust timestamps for incoming items
    const updatedIncoming = mergedItems.map(item => {
        const existing = existingItems.find(e => e.product === item.product);
        return {
            ...item,
            addedAt: existing ? existing.addedAt : new Date(),
            isMMC: item.isMMC || (item.product && String(item.product).startsWith('mmc-'))
        };
    });

    // Add existing items that aren't in the incoming list
    const onlyInExisting = existingItems.filter(e =>
        !incomingItems.some(i => i.product === e.product)
    );

    const finalItems = [...updatedIncoming, ...onlyInExisting];
    const filteredItems = filterExpiredCartItems(finalItems);

    // One more check after merge just in case (though incoming should represent the full current front-end cart)
    let finalHasMMC = false;
    let finalHasReadyMade = false;
    filteredItems.forEach(item => {
        if (item.isMMC || (item.product && String(item.product).startsWith('mmc-'))) finalHasMMC = true;
        else finalHasReadyMade = true;
    });

    if (finalHasMMC && finalHasReadyMade) {
        res.status(400);
        throw new Error("Custom cakes and ready-made cakes cannot be ordered together. Please place separate orders.");
    }

    if (filteredItems.length === 0) {
        orderType = null;
    } else if (finalHasMMC) {
        orderType = 'MMC';
    } else if (finalHasReadyMade) {
        orderType = 'READY_MADE';
    }

    if (cart) {
        cart.items = filteredItems;
        cart.orderType = orderType;
        await cart.save();
    } else {
        cart = await Cart.create({
            user: req.user._id,
            items: filteredItems,
            orderType: orderType
        });
    }

    res.status(200).json({
        cart: cart.items,
        orderType: cart.orderType
    });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile,
    addAddress,
    deleteAddress,
    toggleFavorite,
    getFavorites,
    forgotPassword,
    resetPassword,
    verifyEmail,
    syncCart
};
