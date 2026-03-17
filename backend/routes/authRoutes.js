const express = require('express');
const router = express.Router();
const {
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
    debugDB,
    syncCart,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:id', protect, deleteAddress);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:cakeId', protect, toggleFavorite);
router.put('/cart', protect, syncCart);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/verifyemail/:token', verifyEmail);

module.exports = router;
