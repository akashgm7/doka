/**
 * FINAL FIX SCRIPT
 * 1. Drops the problematic unique index on orderId (which blocks new orders)
 * 2. Lists all orders clearly
 * 3. Properly resets user password using bcrypt directly (not through Model to avoid hook issues)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixAll() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to:', mongoose.connection.name);
    const db = mongoose.connection.db;

    // Step 1: Check and drop the problematic unique index on orderId
    console.log('\n=== CHECKING ORDER INDEXES ===');
    const orderIndexes = await db.collection('orders').indexes();
    console.log('Current indexes on orders:', JSON.stringify(orderIndexes.map(i => ({ name: i.name, key: i.key, unique: i.unique })), null, 2));

    const orderIdIndex = orderIndexes.find(i => i.key && i.key.orderId !== undefined && i.unique);
    if (orderIdIndex) {
        console.log('❌ Found problematic unique index on orderId:', orderIdIndex.name);
        await db.collection('orders').dropIndex(orderIdIndex.name);
        console.log('✅ Dropped unique orderId index - new orders can now be saved!');
    } else {
        console.log('✅ No unique index on orderId found (or it was already dropped)');
    }

    // Step 2: List all non-unique indexes on orders to verify
    const updatedIndexes = await db.collection('orders').indexes();
    console.log('\nUpdated indexes:', JSON.stringify(updatedIndexes.map(i => ({ name: i.name, key: i.key, unique: i.unique })), null, 2));

    // Step 3: Count orders
    const totalOrders = await db.collection('orders').countDocuments();
    console.log('\nTotal orders in DB:', totalOrders);

    // Step 4: Reset password using raw bcrypt (bypasses all hooks)
    console.log('\n=== RESETTING PASSWORD ===');
    const user = await db.collection('users').findOne({ email: 'akashrocks843@gmail.com' });
    if (!user) {
        console.log('❌ User not found!');
    } else {
        console.log('Found user:', user._id, user.email);
        const hash = await bcrypt.hash('MyNewPass@123', 10);
        await db.collection('users').updateOne({ _id: user._id }, { $set: { password: hash } });

        // Verify
        const verify = await db.collection('users').findOne({ _id: user._id });
        const matches = await bcrypt.compare('MyNewPass@123', verify.password);
        console.log('✅ Password reset to: MyNewPass@123');
        console.log('✅ Verification (bcrypt.compare):', matches ? 'MATCH ✅' : 'FAIL ❌');

        // Count orders for this user
        const userOrders = await db.collection('orders').countDocuments({ user: user._id });
        console.log('Orders for this user:', userOrders);
    }

    await mongoose.disconnect();
    console.log('\n✅ ALL DONE.');
    console.log('Login with: akashrocks843@gmail.com / MyNewPass@123');
}

fixAll().catch(err => {
    console.error('FATAL ERROR:', err.message);
    process.exit(1);
});
