const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    // Attempt standard connection first with a 3 second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected to database at: ${uri}`);
    return mongoose.connection;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to standard URI (${uri}). Falling back to in-memory MongoDB...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();
      await mongoose.connect(memUri);
      console.log(`[MongoDB] Connected to Embedded MongoDB Memory Server at: ${memUri}`);
      return mongoose.connection;
    } catch (memErr) {
      console.error('[MongoDB] Connection fatal error:', memErr.message);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
  } catch (error) {
    console.error('Error disconnecting from DB:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };
