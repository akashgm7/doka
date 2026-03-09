const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema({
    product: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    customization: {
        shape: String,
        flavour: String,
        design: String,
        size: String,
        message: String,
    },
    isMMC: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now }
});

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    items: [cartItemSchema],
    orderType: {
        type: String,
        enum: ['MMC', 'READY_MADE', null],
        default: null
    }
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
