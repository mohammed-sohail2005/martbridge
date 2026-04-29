const mongoose = require("mongoose");

const vegetableSchema = new mongoose.Schema({
  storeName: { type: String, unique: true, required: true },
  ownerName: String,
  password: String,
  location: String,
  phone: String,
  upi: String,
  upiId: String,
  profileImage: String,
  lat: String,
  lng: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Vegetable", vegetableSchema);
