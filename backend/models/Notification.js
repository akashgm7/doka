const mongoose = require('mongoose');

// Mirror the schema from CAKE2 server — reads from same doka_cake_app DB
const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    target: {
        type: String,
        required: true,
        enum: [
            'All Users', 'Staff', 'Customers',
            'Brand Admins', 'Brand Users', 'Brand Staff', 'Brand Customers',
            'Area Staff', 'Area Manager', 'Store Manager', 'Factory Manager'
        ]
    },
    type: { type: String, enum: ['Manual', 'Automated'], default: 'Manual' },
    status: { type: String, enum: ['Sent', 'Draft', 'Scheduled'], default: 'Sent' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    brandId: { type: String, default: null },
    sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Use the default mongoose connection (doka_cake_app)
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
