/**
 * test_address_save.js
 * Diagnostic: Test if address save works end-to-end in DB.
 * Run with: node test_address_save.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB:', mongoose.connection.host);

        // Find a customer user
        const user = await User.findOne({ role: 'Customer' });
        if (!user) {
            console.error('❌ No customer user found!');
            process.exit(1);
        }
        console.log('Found user:', user._id, user.email);
        console.log('Current addresses count:', user.addresses?.length || 0);

        // Try to add a test address
        const testAddress = {
            label: 'Home',
            addressLine: '123 Test Street',
            city: 'Test City',
            zipCode: '123456',
            coordinates: { lat: 28.6139, lng: 77.2090 }, // Delhi coords
            isDefault: user.addresses.length === 0,
        };

        user.addresses.push(testAddress);
        const saved = await user.save();

        const addedAddr = saved.addresses[saved.addresses.length - 1];
        console.log('✅ Address saved successfully! ID:', addedAddr._id);
        console.log('Total addresses now:', saved.addresses.length);

        // Remove the test address
        user.addresses = user.addresses.filter(a => a._id.toString() !== addedAddr._id.toString());
        await user.save();
        console.log('✅ Test address cleaned up.');

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.errors) {
            for (const [key, val] of Object.entries(err.errors)) {
                console.error('   Validation Error -', key, ':', val.message);
            }
        }
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
};

run();
