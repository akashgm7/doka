const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI;

async function checkOrders() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const Order = mongoose.model('Order', new mongoose.Schema({
            user: mongoose.Schema.Types.ObjectId,
            status: String,
            totalPrice: Number,
            createdAt: Date
        }, { strict: false }));

        const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
        console.log('Last 10 orders:');
        orders.forEach(o => {
            console.log(`ID: ${o._id}, User: ${o.user}, Status: ${o.status}, Items: ${o.orderItems ? o.orderItems.length : 0}, Total: ${o.totalPrice}, CreatedAt: ${o.createdAt.toISOString()}`);
        });

        const users = await mongoose.connection.db.collection('users').find().limit(5).toArray();
        console.log('\nUsers (first 5):');
        users.forEach(u => {
            console.log(`ID: ${u._id}, Email: ${u.email}, LoyaltyPoints: ${u.loyaltyPoints}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkOrders();
