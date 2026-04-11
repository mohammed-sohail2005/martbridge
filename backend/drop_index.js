const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoUri = process.env.MONGO_URI;

async function run() {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('hotels');
        
        console.log('🔍 Checking indexes for "hotels"...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));
        
        const hasEmailIndex = indexes.some(idx => idx.name === 'email_1');
        
        if (hasEmailIndex) {
            console.log('🗑 Dropping "email_1" index...');
            await collection.dropIndex('email_1');
            console.log('✅ Index dropped successfully');
        } else {
            console.log('ℹ️ "email_1" index not found');
        }
        
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
}

run();
