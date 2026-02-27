const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
require('dotenv').config();

async function testLoyalty() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'doka_cake_app' });
        console.log('Connected to DB');

        // 1. Get primary user
        const primaryUser = await User.findOne({ email: 'akashrocks843@gmail.com' });
        if (!primaryUser) throw new Error('Primary user not found');
        console.log('Current Points for User:', primaryUser.loyaltyPoints);

        // 2. Create a mock order to simulate checkout
        const orderPrice = 1500;
        const expectedPoints = 150; // 10%

        const newOrder = new Order({
            user: primaryUser._id,
            orderItems: [{
                name: "Test Cake",
                qty: 1,
                image: "/images/cake1.jpg",
                price: orderPrice,
                product: "test-cake-123"
            }],
            shippingAddress: { address: '123 Test St', city: 'Test City', postalCode: '12345' },
            paymentMethod: 'Razorpay',
            totalPrice: orderPrice,
            earnedLoyaltyPoints: expectedPoints
        });

        // This simulates the order controller
        await newOrder.save();
        primaryUser.loyaltyPoints += expectedPoints;
        await primaryUser.save();
        console.log(`Order created for ${orderPrice}. Awarded ${expectedPoints} points.`);

        // 3. Test CAKE2 Loyalty Stats directly via raw queries
        const pointsData = await Order.aggregate([
            { $group: { _id: null, totalEarned: { $sum: "$earnedLoyaltyPoints" } } }
        ]);
        const totalPointsEarned = pointsData.length > 0 ? pointsData[0].totalEarned : 0;

        const activeMembers = await User.countDocuments({ loyaltyPoints: { $gt: 0 } });

        console.log('--- DB AGGREGATED STATS ---');
        console.log({
            totalPointsEarned,
            totalPointsRedeemed: 0,
            activeMembers,
            redemptionRate: 0
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testLoyalty();
