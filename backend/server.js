const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cakeRoutes = require('./routes/cakeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// Verify critical env vars loaded
console.log('🔧 ENV Check — MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ MISSING');
console.log('🔧 ENV Check — PORT:', process.env.PORT || '5001 (default)');

connectDB();

const app = express();

app.use(cors({
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Global Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use('/api/users', authRoutes);
app.use('/api/cakes', cakeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server started on port ${PORT}`));
