const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Cake = require('./models/Cake');

const verifyCakes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('\n--- Verifying All Cakes ---');
        const allCakes = await Cake.find({});
        console.log(`Total count: ${allCakes.length}`);

        console.log('\n--- Verifying Eggless Cakes ---');
        const egglessCakes = await Cake.find({ isEggless: true });
        const allEggless = egglessCakes.every(c => c.isEggless === true);
        console.log(`Eggless count: ${egglessCakes.length}`);
        console.log(`All are eggless: ${allEggless}`);

        console.log('\n--- Verifying With Egg Cakes ---');
        const withEggCakes = await Cake.find({ isEggless: false });
        const allWithEgg = withEggCakes.every(c => c.isEggless === false);
        console.log(`With Egg count: ${withEggCakes.length}`);
        console.log(`All have egg: ${allWithEgg}`);

        if (allCakes.length === (egglessCakes.length + withEggCakes.length)) {
            console.log('\n✅ Database state is consistent!');
        } else {
            console.log('\n⚠️ Consistency check failed!');
        }

        if (allCakes.length > 0) {
            console.log('\n--- Sample Detailed Entry ---');
            const sample = allCakes[0];
            console.log(`Name: ${sample.name}`);
            console.log(`isEggless: ${sample.isEggless}`);
            console.log(`Ingredients: ${sample.ingredients.join(', ')}`);
        }

        process.exit();
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyCakes();
