/**
 * COMPLETE DATABASE STATE AUDIT + PASSWORD RESET
 * This script will:
 * 1. Show all users that match akash's email
 * 2. Show all orders and which user they belong to
 * 3. Reset the correct user's password using the full User model (with bcrypt hook)
 */
process.env.FORCE_COLOR = '1';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to:', mongoose.connection.name);

    // Load full User model WITH the pre-save hook
    const User = require('./models/User');
    const Order = require('./models/Order');

    // === Step 1: List all users matching akash ===
    const users = await User.find({ email: /akash/i });
    console.log('\n=== ALL AKASH USERS ===');
    users.forEach(u => {
        console.log(`  ID: ${u._id} | Email: "${u.email}" | Status: ${u.status || 'N/A'}`);
    });

    if (users.length === 0) {
        console.log('NO USERS FOUND!');
        await mongoose.disconnect();
        return;
    }

    // === Step 2: Count orders per user ===
    console.log('\n=== ORDERS PER USER ===');
    for (const u of users) {
        const cnt = await Order.countDocuments({ user: u._id });
        console.log(`  ${u.email}: ${cnt} orders`);
    }

    // === Step 3: Reset password for the main user ===
    // Find the user with the most orders (should be the primary)
    let primaryUser = users[0];
    let maxOrders = -1;
    for (const u of users) {
        const cnt = await Order.countDocuments({ user: u._id });
        if (cnt > maxOrders) {
            maxOrders = cnt;
            primaryUser = u;
        }
    }

    console.log('\n=== RESETTING PASSWORD ===');
    console.log(`Primary user: ${primaryUser.email} (${primaryUser._id}) - ${maxOrders} orders`);

    // Use the User model so the pre-save hook runs and bcrypt hashes it properly
    primaryUser.password = 'Reset@1234';
    // Manually mark password as modified so pre-save hook runs
    primaryUser.markModified('password');
    await primaryUser.save();
    console.log('✅ Password reset to: Reset@1234');
    console.log('✅ Email to use:', primaryUser.email);

    // === Step 4: Show all orders for primary user ===
    const orders = await Order.find({ user: primaryUser._id }).sort({ createdAt: -1 });
    console.log(`\n=== ORDERS FOR PRIMARY USER (${orders.length} total) ===`);
    orders.slice(0, 5).forEach(o => {
        const items = o.orderItems.map(i => i.name).join(', ');
        console.log(`  ${o._id}: ${items} - $${o.totalPrice}`);
    });

    await mongoose.disconnect();
    console.log('\nDONE. Use email:', primaryUser.email, 'and password: Reset@1234');
}

run().catch(err => {
    console.error('Script error:', err);
    process.exit(1);
});
