const express = require('express');
const router = express.Router();
const {
    getCakes,
    getCakeById,
    createCake,
    updateCake,
    deleteCake,
} = require('../controllers/cakeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getCakes).post(protect, admin, createCake);
router
    .route('/:id')
    .get(getCakeById)
    .put(protect, admin, updateCake)
    .delete(protect, admin, deleteCake);

module.exports = router;
