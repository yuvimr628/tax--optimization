const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn("MONGO_URI not provided. Running without database connection.");
}

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'https://tax-copilot-ai.vercel.app' // Example prod domain
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tax', require('./routes/taxRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/twin', require('./routes/twinRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/report', require('./routes/reportRoutes'));
app.use('/api/generate-report', require('./routes/carboneRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.stack}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
