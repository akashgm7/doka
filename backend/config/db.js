const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('❌ FATAL: MONGO_URI environment variable is not set!');
        console.error('Please ensure your .env file has MONGO_URI defined.');
        process.exit(1); // Hard fail — never silently fall back to memory
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000, // Important for slow TLS handshakes
            tlsAllowInvalidCertificates: true, // Fix for some internal SSL alerts
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
