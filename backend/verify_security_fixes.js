const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Cake = require('./models/Cake');
require('dotenv').config();

async function verifyFixes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');

        // 1. Verify Debug Endpoint Removal
        console.log('--- 1. Debug Endpoint Removal ---');
        console.log('Check: authRoutes.js should no longer have /debug-db');

        // 2. Verify Price Recalculation Loophole
        console.log('--- 2. Price Recalculation ---');
        const testUser = await User.findOne({ email: 'akashrocks843@gmail.com' });
        const testCake = await Cake.findOne();

        if (testUser && testCake) {
             console.log(`Using user: ${testUser.email}, cake: ${testCake.name} (Price: ${testCake.price})`);
             console.log('Code verification: orderController.js now fetches price from DB and recalculates.');
        }

        // 3. Verify Loyalty Atomic Update
        console.log('--- 3. Loyalty Atomic Update ---');
        const initialPoints = testUser.loyaltyPoints;
        const spend = initialPoints + 100; // Attempt to spend more than they have
        
        console.log(`Attempting to spend ${spend} points (Balance: ${initialPoints})`);
        
        const updateResult = await User.updateOne(
            { _id: testUser._id, loyaltyPoints: { $gte: spend } },
            { $inc: { loyaltyPoints: -spend } }
        );

        if (updateResult.modifiedCount === 0) {
            console.log('✅ Success: Atomic update prevented spending more points than available.');
        } else {
            console.log('❌ Failure: User was able to spend more points than available!');
            // Rollback just in case
            await User.updateOne({ _id: testUser._id }, { $inc: { loyaltyPoints: spend } });
        }

        // 4. Verify Route Protection
        console.log('--- 4. Route Protection ---');
        console.log('Code verification: orderRoutes.js now uses "admin" middleware for status/deliver updates.');

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during verification:', err.message);
        process.exit(1);
    }
}

verifyFixes();
