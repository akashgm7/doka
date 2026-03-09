const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const LoyaltyConfig = require('../models/LoyaltyConfig');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '..', 'debug_orders.log');
const debugLog = (msg) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
};


// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    debugLog(`[ADD_ORDER] User: ${req.user ? req.user._id : 'No User'}, Email: ${req.user ? req.user.email : 'N/A'}`);
    console.log('[ORDER] Request User:', req.user ? req.user._id : 'No User');
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice: clientTotalPrice,
        orderMode,
        redeemedLoyaltyPoints,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        // Handle Loyalty Point Redemption
        let discountAmount = 0;
        const pointsToRedeem = parseInt(redeemedLoyaltyPoints, 10) || 0;

        if (pointsToRedeem > 0) {
            // Check if user has enough points
            if (req.user.loyaltyPoints < pointsToRedeem) {
                console.error(`[LOYALTY] ❌ Insufficient points. Has: ${req.user.loyaltyPoints}, Needs: ${pointsToRedeem}`);
                res.status(400);
                throw new Error('Insufficient loyalty points');
            }
            // 1 point = $1 discount
            discountAmount = pointsToRedeem;
            console.log(`[LOYALTY] Redeeming ${pointsToRedeem} points for $${discountAmount} discount`);
        }

        // Detect IF any item is MMC
        let hasMMC = false;
        let hasReadyMade = false;

        orderItems.forEach(item => {
            const isMMCItem = item.isMMC || (item.product && String(item.product).startsWith('mmc-'));
            if (isMMCItem) hasMMC = true;
            else hasReadyMade = true;
        });

        if (hasMMC && hasReadyMade) {
            res.status(400);
            throw new Error("Custom cakes and ready-made cakes cannot be ordered together. Please place separate orders.");
        }

        const isMMC = hasMMC;
        const orderType = hasMMC ? 'MMC' : 'READY_MADE';

        // Calculate loyalty points using dynamic config
        const config = await LoyaltyConfig.findOne();
        let points = 0;

        // BUG FIX: The frontend already subtracts pointsToRedeem from the total. 
        // We SHOULD NOT subtract it again here. We trust the clientTotalPrice as the final target price.
        const finalTotalPrice = Math.max(0, clientTotalPrice || 0);
        console.log(`[ORDER] Client Total: ${clientTotalPrice}, Discount Applied: ${discountAmount}, Final Storage Price: ${finalTotalPrice}`);

        if (config && config.enabled && finalTotalPrice >= config.minOrderValueForEarn) {
            points = Math.floor(finalTotalPrice * config.earnRate);
        } else if (!config) {
            // Fallback if no config yet
            points = Math.floor(finalTotalPrice * 0.10);
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress: shippingAddress || { address: 'Not provided', city: 'Not provided', postalCode: '00000', country: 'IN' },
            paymentMethod: paymentMethod || 'Mock',
            itemsPrice: itemsPrice || 0,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: finalTotalPrice,
            orderMode: orderMode || 'delivery',
            isPaid: true,
            paidAt: Date.now(),
            paymentStatus: 'Paid',
            status: 'PENDING',
            brandId: 'brand-001',
            isMMC,
            orderType,
            earnedLoyaltyPoints: points,
            redeemedLoyaltyPoints: pointsToRedeem,
            discountAmount: discountAmount,
            paymentResult: {
                id: 'mock_' + Math.random().toString(36).substr(2, 9),
                status: 'COMPLETED',
                update_time: String(Date.now()),
                email_address: req.user.email,
            },
        });

        console.log('[ORDER] Saving order for user:', req.user._id, 'Points earned:', points);
        const createdOrder = await order.save();

        // Calculate the net change: new points earned minus points redeemed
        const pointsNetChange = points - pointsToRedeem;
        let finalUserPoints = 0;

        console.log(`[LOYALTY] Persisting changes. Earned: ${points}, Spent: ${pointsToRedeem}, Net: ${pointsNetChange}`);

        const updateResult = await User.updateOne(
            { _id: req.user._id },
            { $inc: { loyaltyPoints: pointsNetChange } }
        );

        console.log('[LOYALTY] DB Update Result:', updateResult);

        // Fetch the updated user to get the actual truth-of-source balance
        const updatedUser = await User.findById(req.user._id);
        finalUserPoints = updatedUser ? updatedUser.loyaltyPoints : 0;

        console.log(`[LOYALTY] Final confirmed total for user ${req.user._id}: ${finalUserPoints}`);

        const payload = createdOrder.toObject();
        payload.newLoyaltyPoints = finalUserPoints;

        res.status(201).json(payload);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    debugLog(`[GET_MY_ORDERS] User: ${req.user ? req.user._id : 'No User'}, Email: ${req.user ? req.user.email : 'N/A'}`);
    console.log('[ORDER] Fetching orders for user ID:', req.user._id);
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    if (orders.length > 0) {
        console.log(`[ORDER] Most recent order ID being sent: ${orders[0]._id}`);
    }
    debugLog(`[GET_MY_ORDERS] Found ${orders.length} orders for user ${req.user._id}`);
    console.log(`[ORDER] Success! Found ${orders.length} orders for user ${req.user.email}`);
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        const updatedOrder = await order.save();

        // Emit socket event for real-time tracking
        const io = req.app.get('io');
        if (io) {
            io.emit('orderStatusUpdated', {
                orderId: order._id,
                orderNumber: order.orderId,
                status: status
            });
            console.log(`[SOCKET] Emitted orderStatusUpdated for ${order._id}: ${status}`);
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    console.log('[DELIVER] PUT /api/orders/' + req.params.id + '/deliver called');
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'Delivered';

        const updatedOrder = await order.save();

        // Emit socket event for real-time tracking
        const io = req.app.get('io');
        if (io) {
            io.emit('orderStatusUpdated', {
                orderId: order._id,
                orderNumber: order.orderId,
                status: 'Delivered'
            });
            console.log(`[SOCKET] Emitted orderStatusUpdated for ${order._id}: Delivered`);
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Submit feedback for a delivered order
// @route   POST /api/orders/:id/feedback
// @access  Private (order owner only)
const submitFeedback = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        res.status(400);
        throw new Error('Rating must be between 1 and 5');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Only order owner can submit feedback
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to submit feedback for this order');
    }

    if (order.status !== 'DELIVERED') {
        res.status(400);
        throw new Error('Feedback can only be submitted for delivered orders');
    }

    if (order.feedback && order.feedback.rating) {
        res.status(400);
        throw new Error('Feedback already submitted for this order');
    }

    order.feedback = {
        rating: Number(rating),
        comment: comment || '',
        submittedAt: new Date()
    };

    const updatedOrder = await order.save();

    // Emit real-time socket event so Admin dashboard can show feedback live
    const io = req.app.get('io');
    if (io) {
        io.emit('feedbackAdded', {
            orderId: order._id,
            storeId: order.storeId,
            brandId: order.brandId,
            feedback: order.feedback,
            customerName: req.user.name || 'Customer',
            orderRef: order.orderId || order._id
        });
        console.log(`[SOCKET] Emitted feedbackAdded for order: ${order._id}`);
    }

    res.json(updatedOrder);
});

module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders,
    updateOrderToDelivered,
    updateOrderStatus,
    submitFeedback,
};
