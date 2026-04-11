const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const Department = require('./models/Department');

async function check() {
  const mongoUri = 'mongodb+srv://sohail:sohail1234@martbridge.8idy7bf.mongodb.net/martbridge?retryWrites=true&w=majority&appName=martbridge';
  await mongoose.connect(mongoUri);
  const hotels = await Hotel.find({});
  const depts = await Department.find({});
  
  console.log('--- HOTELS ---');
  hotels.forEach(h => {
    console.log(`Name: ${h.hotelName}, ID: ${h._id}, LinkedStore: ${h.linkedStoreId}`);
  });
  
  console.log('\n--- DEPARTMENTS ---');
  depts.forEach(d => {
    console.log(`Name: ${d.storeName}, ID: ${d._id}`);
  });
  
  process.exit();
}

check();
