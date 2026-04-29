const mongoose = require("mongoose");

const laborSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Store or Hotel ID
  ownerType: { type: String, enum: ["department", "meat", "vegetable", "hotel"], required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ["Cooking Master", "Server", "Cleaner", "General"], default: "General" },
  salary: { type: Number, required: true },
  phone: { type: String, default: "" },
  upiLink: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Labor", laborSchema);
