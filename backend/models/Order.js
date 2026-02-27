const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
                product: {
                    type: String, // Changed from ObjectId to String to support custom cake IDs (mmc-...)
                    required: true,
                },
                customization: {
                    shape: { type: String },
                    flavour: { type: String },
                    design: { type: String },
                    size: { type: String },
                    message: { type: String }
                },
                isMMC: { type: Boolean, default: false }
            },
        ],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        orderMode: {
            type: String,
            enum: ['dine-in', 'pickup', 'delivery'],
            default: 'delivery'
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending'
        },
        brandId: {
            type: String,
            default: 'brand-001'
        },
        isMMC: {
            type: Boolean,
            default: false
        },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Baking', 'In Production', 'Ready', 'Delivered', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        earnedLoyaltyPoints: {
            type: Number,
            default: 0,
        },
        redeemedLoyaltyPoints: {
            type: Number,
            default: 0,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
