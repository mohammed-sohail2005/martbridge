const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    morningOrders: [{
        name: String,
        price: Number,
        quantity: Number,
        unit: { type: String, default: "kg" } // e.g., kg, pcs, cleanup later if needed
    }],
    eveningOrders: [{
        name: String,
        price: Number,
        quantity: Number,
        unit: { type: String, default: "kg" }
    }],
    extraOrders: [{
        name: String,
        price: Number,
        quantity: Number,
        unit: { type: String, default: "kg" }
    }],
    morningStatus: { type: String, enum: ["draft", "sent"], default: "draft" },
    eveningStatus: { type: String, enum: ["draft", "sent"], default: "draft" },
    extraStatus: { type: String, enum: ["draft", "sent"], default: "draft" },
    morningStockProcessed: { type: Boolean, default: false },
    eveningStockProcessed: { type: Boolean, default: false },
    extraStockProcessed: { type: Boolean, default: false },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    pendingAmount: {
        type: Number,
        default: 0
    },
    payments: [{
        amount: Number,
        utrNumber: String,
        status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
        paidAt: { type: Date, default: Date.now },
        confirmedAt: Date
    }]
}, { timestamps: true });

// Compound index to ensure one bill per hotel per date
billSchema.index({ hotelId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Bill", billSchema);
