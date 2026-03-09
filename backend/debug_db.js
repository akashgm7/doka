const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

async function checkOrders() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('Connecting to: ' + MONGO_URI);
        await mongoose.connect(MONGO_URI);
        log('Connected to MongoDB');

        const orders = await mongoose.connection.db.collection('orders').find().sort({ createdAt: -1 }).limit(10).toArray();

        log('\nDetail Check of last 10 orders:');
        orders.forEach(o => {
            const userType = typeof o.user;
            const isObjectId = o.user instanceof mongoose.Types.ObjectId;
            const userVal = o.user ? o.user.toString() : 'null';
            const itemsCount = o.orderItems ? o.orderItems.length : 0;
            log(`Order ID: ${o._id}, User: ${userVal}, UserType: ${userType}, isObjectId: ${isObjectId}, Items: ${itemsCount}, CreatedAt: ${o.createdAt ? o.createdAt.toISOString() : 'N/A'}`);
        });

        const targetUserId = '699ab343f758af187f896576';
        const ordersForUserObj = await mongoose.connection.db.collection('orders').find({ user: new mongoose.Types.ObjectId(targetUserId) }).toArray();
        const ordersForUserStr = await mongoose.connection.db.collection('orders').find({ user: targetUserId }).toArray();

        log(`\nQuery test for User ${targetUserId}:`);
        log(`Orders found with ObjectId: ${ordersForUserObj.length}`);
        log(`Orders found with String: ${ordersForUserStr.length}`);

        await mongoose.disconnect();
    } catch (err) {
        log('Error: ' + err.message);
    } finally {
        fs.writeFileSync('db_check_result.txt', output);
    }
}

checkOrders();
