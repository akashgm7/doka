const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Cake = require('../models/Cake');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        console.log('\n--- Checking Cakes Collection ---');
        const cakes = await Cake.find({});
        console.log(`Total Cakes Found: ${cakes.length}`);

        if (cakes.length > 0) {
            console.log('Listing cakes:');
            cakes.forEach(cake => {
                console.log(`- ID: ${cake._id}, Name: ${cake.name}, Price: ${cake.price}`);
            });
        } else {
            console.log('No cakes found. Orders will fail because they reference invalid Cake IDs.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
