require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// --- Import Central Router (Placeholder for now) ---
const apiRouter = require('./routes/v1'); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

connectDB();

// --- Middleware Setup ---
const corsOptions = {
    origin: ['http://localhost:5173'], 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// --- API Routes ---
app.get('/', (req, res) => {
    res.send('AssetVerse Server is running! Status: OK');
});

// Central API Router (All v1 endpoints start here)
app.use('/api/v1', apiRouter); 

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).send({ 
        success: false, 
        message: 'Resource Not Found',
        path: req.path
    });
});

// --- General Error Handling Middleware (500 Server Errors) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        success: false,
        message: 'Something went wrong on the server!',
        error: err.message
    });
});

// --- Server Listener ---
app.listen(PORT, () => {
    console.log(`AssetVerse Server listening on port ${PORT}`);
});