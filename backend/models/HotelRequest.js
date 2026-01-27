const mongoose = require("mongoose");

const hotelRequestSchema = new mongoose.Schema({
  departmentName: String,
  departmentId: String,

  hotelName: String,
  ownerName: String,
  email: String,
  location: String,
  upi: String,

  status: { type: String, default: "pending" } // pending | accepted

}, { timestamps: true });

module.exports = mongoose.model("HotelRequest", hotelRequestSchema);
