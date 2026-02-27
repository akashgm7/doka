const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config();

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`🍃 Connected to DB`);

        // Get last 5 orders sorted by creation time
        const orders = await Order.find({}).sort({ createdAt: -1 }).limit(5);

        console.log('\n📊 Recent 5 Orders:');
        orders.forEach(order => {
            console.log(`\nOrder ID: ${order._id}`);
            console.log(`Created At: ${order.createdAt}`);
            console.log(`Status: ${order.status}`);
            console.log(`Is Paid: ${order.isPaid}`);
            console.log(`Paid At: ${order.paidAt}`);
            // Check if mock payment result exists
            console.log(`Payment Result:`, order.paymentResult);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkOrders();
