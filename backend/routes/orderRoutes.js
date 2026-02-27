const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    getMyOrders,
    updateOrderToDelivered,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/deliver').put(protect, updateOrderToDelivered);

module.exports = router;
