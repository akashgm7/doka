const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    getMyOrders,
    updateOrderToDelivered,
    updateOrderStatus,
    submitFeedback,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/deliver').put(protect, updateOrderToDelivered);
router.route('/:id/status').put(protect, updateOrderStatus);
router.route('/:id/feedback').post(protect, submitFeedback);

module.exports = router;
