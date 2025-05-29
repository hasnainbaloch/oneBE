import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import redisClient from './src/config/redis';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    // Create an in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    
    // Ensure Redis is connected
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    // Clear all data
    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
    }
    await redisClient.flushDb();
});

afterAll(async () => {
    // Clean up database connections
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    if (redisClient.isOpen) {
        await redisClient.flushDb();
        await redisClient.quit();
    }
    
    if (mongoServer) {
        await mongoServer.stop();
    }
}); 