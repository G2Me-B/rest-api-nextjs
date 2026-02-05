import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const connect = async () => {
    const connectionState = mongoose.connection.readyState;
    
    if (connectionState === 1) {
        console.log('MongoDB is ready connected.');
        return;
    }
    if (connectionState === 2) {
        console.log('MongoDB connection is in progress.');
        return;
    }
    try {
        mongoose.connect(MONGODB_URI!,{
            dbName: 'rest-api-nextjs',
            bufferCommands: true,
        });
        console.log('MongoDB connected successfully.');
    } catch (error: unknown) {
        console.error('Error connecting to MongoDB:', error);
        throw new Error("Error connecting to MongoDB: " + error);
    }
}

export default connect;