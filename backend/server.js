const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const fs = require('fs');
const fsPath = require('path');

const accessLogStream = (req) => {
    const authHeader = req.headers.authorization || 'No Auth';
    const logBatch = `[${new Date().toISOString()}] ${req.method} ${req.url} Auth: ${authHeader.substring(0, 20)}...\n`;
    fs.appendFileSync(fsPath.join(__dirname, 'all_requests.log'), logBatch);
};
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
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
});

// Make io accessible to our routes/controllers
app.set('io', io);

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
    accessLogStream(req);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use('/api/users', authRoutes);
app.use('/api/cakes', cakeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Cake Customer API is running');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server started on port ${PORT}`));

module.exports = app; // Export app for testing if needed
