const mongoose = require('mongoose');

// MongoDB connection string 
const mongoURI = 'mongodb://localhost:27017/spotify-clone';

async function checkMongoConnection() {
  console.log('Attempting to connect to MongoDB...');
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database name: ${conn.connection.name}`);
    console.log(`✅ Connection state: ${conn.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
    
    // Check existing collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n📊 Available collections:');
    if (collections.length === 0) {
      console.log('  No collections found (database might be empty)');
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('\n🚨 MongoDB connection failed. Please check:');
    console.log('  1. Is MongoDB running? Try: brew services start mongodb-community');
    console.log('  2. Is the connection string correct?');
    console.log('  3. Are there any network/firewall issues?');
  }
}

checkMongoConnection(); 