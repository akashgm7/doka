const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'name email loyaltyPoints');
        console.log('Users in DB:');
        users.forEach(u => console.log(`- ${u.name} (${u.email}): ${u.loyaltyPoints} pts`));
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
