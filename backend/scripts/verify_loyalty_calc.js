const mongoose = require('mongoose');
const LoyaltyConfig = require('../models/LoyaltyConfig');
require('dotenv').config();

async function verifyLoyaltyCalculation() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'doka_cake_app' });
        console.log('Connected to DB');

        const config = await LoyaltyConfig.findOne();
        console.log('--- DATABASE CONFIG ---');
        console.log('Earn Rate:', config ? config.earnRate : 'No config found (using default)');

        const testOrderValue = 1000;
        const earnRate = config ? config.earnRate : 0.1;
        const expectedPoints = Math.floor(testOrderValue * earnRate);

        console.log('--- TEST CALCULATION ---');
        console.log(`Order Value: ${testOrderValue}`);
        console.log(`Calculated Points: ${expectedPoints}`);

        if (expectedPoints === 100) {
            console.log('✅ Success: Points are correctly calculated at 10%');
        } else {
            console.log('❌ Failure: Points are not calculated at 10%');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyLoyaltyCalculation();
