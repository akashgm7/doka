const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Cake = require('../models/Cake');
const User = require('../models/User');

const products = [
    {
        name: 'Velvet Dream',
        image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&auto=format&fit=crop&q=60',
        description: 'A luxurious red velvet cake with cream cheese frosting.',
        brand: 'DOKA Signature',
        category: 'Signature',
        price: 45.00,
        countInStock: 10,
        rating: 4.8,
        numReviews: 12,
    },
    {
        name: 'Chocolate Truffle',
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&auto=format&fit=crop&q=60',
        description: 'Rich dark chocolate layers with truffle ganache.',
        brand: 'ChocoLuxe',
        category: 'Chocolate',
        price: 55.00,
        countInStock: 7,
        rating: 4.9,
        numReviews: 8,
    },
    {
        name: 'Strawberry Bliss',
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60',
        description: 'Fresh strawberries and light sponge cake.',
        brand: 'FreshBakes',
        category: 'Fruit',
        price: 40.00,
        countInStock: 5,
        rating: 4.7,
        numReviews: 15,
    },
    {
        name: 'Vanilla Bean',
        image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&auto=format&fit=crop&q=60',
        description: 'Classic vanilla bean cake with buttercream.',
        brand: 'Classic',
        category: 'Standard',
        price: 35.00,
        countInStock: 10,
        rating: 4.5,
        numReviews: 4,
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);

        const user = await User.findOne();
        if (!user) {
            console.log('No user found! Create a user first.');
            process.exit(1);
        }

        // Add user to products
        const sampleProducts = products.map((product) => {
            return { ...product, user: user._id };
        });

        await Cake.deleteMany(); // Clear existing products
        console.log('Existing products cleared.');

        await Cake.insertMany(sampleProducts);
        console.log('Data Imported!');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
