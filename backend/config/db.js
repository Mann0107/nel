const mongoose = require('mongoose');

let mongod = null;

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  const timeout = process.env.VERCEL ? 30000 : 3000;
  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionkart';

  cachedConnection = (async () => {
    try {
      const conn = await mongoose.connect(dbUri, {
        serverSelectionTimeoutMS: timeout,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      // Auto-seed if database is empty or has fewer than 20 products
      const User = require('../models/User');
      const Product = require('../models/Product');
      const userCount = await User.countDocuments();
      const productCount = await Product.countDocuments();
      if (userCount === 0 || productCount < 20) {
        console.log('Database needs seeding/updates. Auto-seeding default credentials and products...');
        const seedData = require('../utils/seeder');
        await seedData(false);
        console.log('Auto-seeding complete.');
      }
      return conn;
    } catch (error) {
      if (process.env.VERCEL) {
        console.error('Failed to connect to MongoDB on Vercel:', error);
        throw error;
      }
      console.log('\n================================================================');
      console.log('NOTICE: Local MongoDB service is not running or refused connection.');
      console.log('Starting an In-Memory MongoDB Server for fallback execution...');
      console.log('================================================================\n');
      
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        
        const conn = await mongoose.connect(uri);
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
        console.log(`In-Memory URI: ${uri}`);
  
        const seedData = require('../utils/seeder');
        console.log('Programmatically seeding in-memory database with products, categories and zones...');
        await seedData(false);
        console.log('In-memory database seeding complete!\n');
        return conn;
      } catch (err) {
        console.error(`In-Memory MongoDB Error: ${err.message}`);
        throw err;
      }
    }
  })();

  cachedConnection.catch((err) => {
    cachedConnection = null;
  });

  return cachedConnection;
};

module.exports = connectDB;
