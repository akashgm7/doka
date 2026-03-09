const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Cake = require('./models/Cake');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkCakes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const cakes = await Cake.find({});
        console.log(`Found ${cakes.length} cakes`);

        cakes.forEach(c => {
            console.log(`Cake: ${c.name}, isEggless: ${c.isEggless}, type: ${typeof c.isEggless}`);
        });

        const egglessCount = await Cake.countDocuments({ isEggless: true });
        const withEggCount = await Cake.countDocuments({ isEggless: false });

        console.log(`\nEggless Count: ${egglessCount}`);
        console.log(`With Egg Count: ${withEggCount}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkCakes();
