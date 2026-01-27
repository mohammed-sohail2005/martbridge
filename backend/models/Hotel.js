const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  hotelName: String,
  ownerName: String,
  email: { type: String, unique: true },
  password: String,
  location: String,
  upi: String,
  profileImage: String,

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Hotel", hotelSchema);
