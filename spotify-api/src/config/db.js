const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string - ưu tiên cloud, fallback to local
    let mongoURI = process.env.MONGODB_URI;
    
    // Nếu không có cloud URI, thử local
    if (!mongoURI || mongoURI.includes('example.mongodb.net')) {
      mongoURI = 'mongodb://localhost:27017/spotify-clone';
      console.log('Using local MongoDB...');
    } else {
      console.log('Using cloud MongoDB...');
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // Fallback to in-memory database for demo
    console.log('🔄 Falling back to in-memory storage...');
    console.log('⚠️  Note: Data will not persist between restarts');
    
    // Create a mock database connection
    const mockConnection = {
      connection: {
        host: 'in-memory',
        readyState: 1
      }
    };
    
    return mockConnection;
  }
};

module.exports = connectDB; 