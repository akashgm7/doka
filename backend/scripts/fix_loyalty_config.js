const mongoose = require('mongoose');
const LoyaltyConfig = require('../models/LoyaltyConfig');
require('dotenv').config();

async function fixLoyaltyConfig() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'doka_cake_app' });
        console.log('Connected to DB');

        const config = await LoyaltyConfig.findOne();
        if (config) {
            console.log('Current Config:', {
                enabled: config.enabled,
                earnRate: config.earnRate
            });

            if (config.earnRate === 1) {
                config.earnRate = 0.1;
                await config.save();
                console.log('✅ Updated earnRate to 0.1');
            } else {
                console.log('ℹ️ earnRate is already not 1. No change needed.');
            }
        } else {
            console.log('ℹ️ No existing LoyaltyConfig found. Default will be used by model.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixLoyaltyConfig();
