const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  storeName: { type: String, unique: true, required: true },
  ownerName: String,
  password: String,
  location: String,
  phone: String,
  upi: String,
  profileImage: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Department", departmentSchema);
