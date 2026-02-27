const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
require('dotenv').config();

const testOrderCreation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`🍃 Connected to DB`);

        // Find a user
        const user = await User.findOne();
        if (!user) {
            console.log('No user found');
            process.exit(1);
        }

        console.log(`Creating order for user ${user._id}`);

        const orderData = {
            orderItems: [{
                name: 'Test Cake',
                qty: 1,
                image: 'test.jpg',
                price: 50,
                product: 'test-product-id'
            }],
            user: user._id,
            shippingAddress: {
                address: 'Test St',
                city: 'Test City',
                postalCode: '12345',
                country: 'Test Country'
            },
            paymentMethod: 'Test',
            itemsPrice: 50,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 50,

            // EXPLICIT VALUES WE WANT TO TEST
            isPaid: true,
            paidAt: Date.now(),
            status: 'Confirmed',
            paymentResult: {
                id: 'debug_id',
                status: 'COMPLETED',
                update_time: String(Date.now()),
                email_address: user.email,
            },
        };

        const order = new Order(orderData);
        const createdOrder = await order.save();

        console.log('\n✅ Order Created!');
        console.log('ID:', createdOrder._id);
        console.log('Status:', createdOrder.status);
        console.log('Is Paid:', createdOrder.isPaid);
        console.log('Paid At:', createdOrder.paidAt);

        if (createdOrder.status !== 'Confirmed') {
            console.error('❌ Status mismatch! Expected Confirmed, got ' + createdOrder.status);
        }
        if (createdOrder.isPaid !== true) {
            console.error('❌ isPaid mismatch! Expected true, got ' + createdOrder.isPaid);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testOrderCreation();
