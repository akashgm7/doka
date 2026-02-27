const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        console.log("Connected successfully to DB");
        const db = client.db('doka_cake_app');

        const email = 'akashrocks843@gmail.com';
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            console.log("User not found!");
            return;
        }

        console.log("Found user:", user.email, "loyaltyPoints:", user.loyaltyPoints);

        const newPassword = 'MyNewPass@123';
        const hash = await bcrypt.hash(newPassword, 10);

        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: hash } }
        );

        console.log("Password hard-reset to:", newPassword);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
