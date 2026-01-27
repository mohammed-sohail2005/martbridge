const mongoose = require("mongoose");

const vegetableSchema = new mongoose.Schema({
  storeName: String,
  ownerName: String,
  email: { type: String, unique: true },
  password: String,
  location: String,
  phone: String,
  upi: String,
  profileImage: String,
  lat: String,
  lng: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Vegetable", vegetableSchema);
