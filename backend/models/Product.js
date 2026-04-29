const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    storeName: {
        type: String, // ✅ Added Store Name
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    minStock: {
        type: Number,
        default: 5
    },
    unit: {
        type: String,
        default: "kg"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Product", productSchema);
