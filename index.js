// Express
import express from 'express';
// Dotenv
import dotenv from 'dotenv';
// CORS
import cors from 'cors';
// DB Connection
import connectDB from './config/db.js';
// Routes
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();
app.use(express.json());

// Dotenv
dotenv.config();

// Make the connection to MongoDB
connectDB();

// CORS
/* const whitelist = [process.env.CLIENT_URL];

const corsOptions = {
    origin: function(origin, callback) {
        if(whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS Error'))
        }
    }
}

app.use(cors(corsOptions)) */

app.use('/v1/users', userRoutes);
app.use('/v1/order', orderRoutes);

// Server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running in port: ${PORT}`)
})