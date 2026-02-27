const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Order = require('../models/Order');
const User = require('../models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);

        // 1. Get a valid user
        const user = await User.findOne();
        if (!user) {
            console.log('No users found. Create a user first.');
            process.exit(1);
        }
        console.log(`Using user: ${user._id}`);

        // 2. Try to create an order with an "mmc-" style product ID
        const fakeProductId = 'mmc-' + Date.now();
        console.log(`Attempting to save order with product ID: ${fakeProductId}`);

        const order = new Order({
            user: user._id,
            orderItems: [{
                name: 'Custom Cake',
                qty: 1,
                image: 'http://example.com/cake.jpg',
                price: 50,
                product: fakeProductId // <--- This should fail casting to ObjectId
            }],
            shippingAddress: {
                address: '123 St', city: 'City', postalCode: '123', country: 'CA'
            },
            paymentMethod: 'PayPal',
            itemsPrice: 50,
            taxPrice: 0,
            shippingPrice: 10,
            totalPrice: 60
        });

        const createdOrder = await order.save();
        console.log('SUCCESS: Order saved!', createdOrder._id);

    } catch (error) {
        console.log('EXPECTED ERROR CAUGHT:');
        console.log(error.message);
        if (error.name === 'ValidationError') {
            console.log('Validation failed as expected.');
        }
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

run();
