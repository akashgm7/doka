const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Cake = require('../models/Cake');

const updateCakes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const cakes = await Cake.find({});
        console.log(`Found ${cakes.length} cakes to update`);

        for (let i = 0; i < cakes.length; i++) {
            const cake = cakes[i];

            // Randomly assign isEggless for variety in testing
            // or we could use common name patterns if applicable
            const isEggless = i % 2 === 0;
            const ingredients = isEggless
                ? ['Flour', 'Sugar', 'Milk', 'Vanilla', 'Butter', 'Baking Powder']
                : ['Flour', 'Sugar', 'Eggs', 'Milk', 'Vanilla', 'Butter'];

            cake.isEggless = isEggless;
            cake.ingredients = ingredients;
            await cake.save();
            console.log(`Updated cake: ${cake.name} (isEggless: ${isEggless})`);
        }

        console.log('All cakes updated successfully');
        process.exit();
    } catch (error) {
        console.error('Error updating cakes:', error);
        process.exit(1);
    }
};

updateCakes();
