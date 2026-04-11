const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  profileImage: { type: String, default: "" }, // Base64 or URL
  hotelName: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  password: { type: String, required: true },
  linkedStoreId: { type: mongoose.Schema.Types.ObjectId, required: true },
  storeType: { type: String, enum: ["department", "meat", "vegetable"], default: "department" },
  morningTemplate: [{
    name: String,
    price: Number,
    quantity: Number,
    unit: { type: String, default: "kg" }
  }],
  eveningTemplate: [{
    name: String,
    price: Number,
    quantity: Number,
    unit: { type: String, default: "kg" }
  }],
  morningOrderTime: { type: String, default: "08:00" },
  eveningOrderTime: { type: String, default: "19:00" }
}, { timestamps: true });

module.exports = mongoose.model("Hotel", hotelSchema);
