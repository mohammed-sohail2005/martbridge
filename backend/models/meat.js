const mongoose = require("mongoose");

const meatSchema = new mongoose.Schema({
  storeName: String,
  ownerName: String,
  email: String,
  password: String,
  location: String,
  phone: String,
  upi: String,
  profileImage: String,
  lat: String,
  lng: String
}, { timestamps: true });

module.exports = mongoose.model("Meat", meatSchema);
