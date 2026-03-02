const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const LoyaltyConfig = require('../models/LoyaltyConfig');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
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
        const isMMC = orderItems.some(item =>
            item.product && String(item.product).startsWith('mmc-')
        );

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
    console.log('[ORDER] Fetching orders for user:', req.user._id);
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log(`[ORDER] Found ${orders.length} orders`);
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

module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders,
    updateOrderToDelivered,
    updateOrderStatus,
};
