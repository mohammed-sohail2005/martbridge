const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  storeName: String,
  ownerName: String,
  email: { type: String, unique: true },
  password: String,
  location: String,
  phone: String,
  upi: String,
  profileImage: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Department", departmentSchema);
