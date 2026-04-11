const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    hotelId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Hotel", 
        required: true 
    },
    storeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    storeType: { 
        type: String, 
        enum: ["department", "meat", "vegetable"], 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["pending_confirmation", "confirmed", "rejected"], 
        default: "pending_confirmation" 
    },
    initiatedAt: { 
        type: Date, 
        default: Date.now 
    },
    confirmedAt: { 
        type: Date 
    }
});

module.exports = mongoose.model("Payment", paymentSchema);
