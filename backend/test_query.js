const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');

async function testApi() {
  const mongoUri = 'mongodb+srv://sohail:sohail1234@martbridge.8idy7bf.mongodb.net/martbridge?retryWrites=true&w=majority&appName=martbridge';
  await mongoose.connect(mongoUri);
  
  const storeId = "698ac6cfc4dd8276c60bdcf9"; // sohail store ID
  console.log('Testing query for StoreID:', storeId);
  
  const hotels = await Hotel.find({ linkedStoreId: storeId });
  console.log('Found Hotels (string query):', hotels.length);
  
  const hotelsObj = await Hotel.find({ linkedStoreId: new mongoose.Types.ObjectId(storeId) });
  console.log('Found Hotels (ObjectId query):', hotelsObj.length);
  
  process.exit();
}

testApi();
