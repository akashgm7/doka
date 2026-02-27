const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI;
        console.log('Original URI:', mongoUri);

        // REPLICATING LOGIC FROM db.js TO TEST IT
        const isInvalidUri = !mongoUri || mongoUri.includes('<password>') || mongoUri.includes('cluster0.mongodb.net');
        console.log('Is Invalid URI check (from db.js logic):', isInvalidUri);

        if (isInvalidUri) {
            console.log('⚠️  WARNING: app would fall back to in-memory DB based on current logic!');
        } else {
            console.log('✅ App would use persistent DB.');
        }

        // Force connection to the URI in .env to check content
        await mongoose.connect(mongoUri);
        console.log(`\n🍃 Connected to: ${mongoose.connection.host}`);

        const users = await User.find({});
        console.log(`\n📊 Found ${users.length} users in database.`);

        users.forEach(user => {
            console.log(`\nUser: ${user.name} (${user.email})`);
            console.log(`ID: ${user._id}`);
            console.log(`Addresses count: ${user.addresses.length}`);
            if (user.addresses.length > 0) {
                console.log('Addresses:', JSON.stringify(user.addresses, null, 2));
            } else {
                console.log('No addresses saved.');
            }
        });

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
