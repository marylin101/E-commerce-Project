//Loading environment viariables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const{connectDB} = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: process.env.CLIENT_URL|| '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) =>{
    res.status(200).json({
        success: true,
        data: { message: "The Study Desk's API is running."},
        error: null
        });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((req,res,next) =>{
    const error = new Error('Cannot '+req.method+' '+req.originalUrl);
    error.statusCode = 404;
    next(error);
})

app.use(errorHandler);

const startServer = async () => {
    try{
        if(process.env.MONGO_URI){
            await connectDB();
        }
        else{
            console.warn('MONGO_URI is not found in environment.');
        }
        app.listen(PORT, () => {
            console.log(`The Study Desk API is running on port ${PORT}`);
        });
    }
    catch(err){
        console.error('The Study Desk API experienced an error while starting the server:', err.message);
        process.exit(1);
    }

}
startServer();
module.exports = app;
