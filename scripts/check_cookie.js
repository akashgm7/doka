const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'doka_cake_app' });
        console.log('Connected to doka_cake_app');

        const collection = mongoose.connection.db.collection('cakes');
        const items = await collection.find({}).toArray();

        console.log(`Checking 'cakes' collection. Total items: ${items.length}`);

        const cookie = items.find(i => i.name.toLowerCase().includes('cookie'));
        if (cookie) {
            console.log('FOUND COOKIE:', JSON.stringify(cookie, null, 2));
        } else {
            console.log('COOKIE NOT FOUND in cakes collection.');
            // Check other potential collections just in case
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Collections available:', collections.map(c => c.name));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Check failed:', err.message);
    }
};

verify();
