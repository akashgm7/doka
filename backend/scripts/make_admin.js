const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const email = process.argv[2];
        if (!email) {
            console.error('Please provide an email: node scripts/make_admin.js user@example.com');
            process.exit(1);
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        user.role = 'Super Admin';
        user.isAdmin = true;
        user.isVerified = true;
        await user.save();

        console.log(`User ${email} is now a Super Admin`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
