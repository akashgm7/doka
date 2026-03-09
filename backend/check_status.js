const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const Order = require('./models/Order');

async function checkStatuses() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const orders = await Order.find({ user: '699ab343f758af187f896576' }).sort({ createdAt: -1 }).limit(5);

        let output = "Recent Order Statuses for user 699ab343f758af187f896576:\n";
        orders.forEach(o => {
            output += `Order ID: ${o._id}, Status: ${o.status}, isDelivered: ${o.isDelivered}, Feedback: ${o.feedback ? JSON.stringify(o.feedback) : 'None'}\n`;
        });

        fs.writeFileSync('order_status_check.txt', output);
        console.log('Results written to order_status_check.txt');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStatuses();
