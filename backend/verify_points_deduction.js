const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

async function testDeduction() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'akash@example.com' }); // Assuming this is the test user
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log(`Current Points for ${user.email}: ${user.loyaltyPoints}`);

        const spend = 10;
        const earn = 5;
        const net = earn - spend;

        console.log(`Simulating order: Spend ${spend}, Earn ${earn}, Net Change ${net}`);

        const result = await User.updateOne(
            { _id: user._id },
            { $inc: { loyaltyPoints: net } }
        );

        console.log('Update Result:', result);

        const updatedUser = await User.findById(user._id);
        console.log(`New Points for ${user.email}: ${updatedUser.loyaltyPoints}`);

        // Cleanup: Reset points if needed or leave as is for verification
        // await User.updateOne({ _id: user._id }, { $inc: { loyaltyPoints: -net } });

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testDeduction();
