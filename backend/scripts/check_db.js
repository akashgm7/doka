const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/User');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        console.log('\n--- Checking Users Collection ---');
        const users = await User.find({});
        console.log(`Total Users Found: ${users.length}`);

        if (users.length > 0) {
            console.log('Listing users (passwords hidden):');
            users.forEach(user => {
                console.log(`- ID: ${user._id}, Name: ${user.name}, Email: ${user.email}, Created: ${user.createdAt}`);
            });
        } else {
            console.log('No users found in the database yet.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
