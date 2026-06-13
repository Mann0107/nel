const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    // Attempt standard connection first with a fast timeout (3 seconds)
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionkart', {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed if database is empty or has fewer than 20 products (updating catalog)
    const User = require('../models/User');
    const Product = require('../models/Product');
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    if (userCount === 0 || productCount < 20) {
      console.log('Atlas/Production database needs updates. Auto-seeding default credentials and products...');
      const seedData = require('../utils/seeder');
      await seedData(false);
      console.log('Auto-seeding complete.');
    }
  } catch (error) {
    console.log('\n================================================================');
    console.log('NOTICE: Local MongoDB service is not running or refused connection.');
    console.log('Starting an In-Memory MongoDB Server for fallback execution...');
    console.log('================================================================\n');
    
    try {
      // Create In-Memory MongoDB Instance
      // Create In-Memory MongoDB Instance dynamically
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      console.log(`In-Memory URI: ${uri}`);

      // Call database seeder to populate in-memory MongoDB
      const seedData = require('../utils/seeder');
      console.log('Programmatically seeding in-memory database with products, categories and zones...');
      await seedData(false); // seed but do not close connection
      console.log('In-memory database seeding complete!\n');
    } catch (err) {
      console.error(`In-Memory MongoDB Error: ${err.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
