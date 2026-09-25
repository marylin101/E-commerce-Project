require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const APIhealthRoutes = require('./routes/APIhealthRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

const PORT = process.env.PORT || 5000;
const URL = process.env.CLIENT_URL;

const corsOptions = {
    origin: function (origin, callback) {
        // Reflect origin dynamically to support Live Server (127.0.0.1:5500, localhost:5500, etc.)
        callback(null, origin || true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// API routes
app.use('/api/health', APIhealthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// Static frontend file serving
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname));

// Default root redirect to home page
app.get('/', (req, res) => {
    res.redirect('/pages/home.html');
});

// 404 handler for unmatched API routes
app.use('/api', (req, res, next) => {
    const error = new Error('Cannot ' + req.method + ' ' + req.originalUrl);
    error.statusCode = 404;
    next(error);
});

app.use(errorHandler);

const startServer = async () => {
    try {
        if (process.env.MONGO_URI) {
            await connectDB();
        } else {
            console.warn('MONGO_URI is not found in environment.');
        }
        app.listen(PORT, () => {
            console.log(`The Study Desk API is running on port: ${PORT} URL: ${URL}`);
        });
    } catch (err) {
        console.error('The Study Desk API experienced an error while starting the server:', err.message);
        process.exit(1);
    }
};

startServer();
module.exports = app;

