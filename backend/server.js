const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const dns = require("dns");

// 🌍 Fix for Mobile Hotspot DNS Issues
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  console.log("✅ DNS servers set to Google DNS (8.8.8.8)");
} catch (e) {
  console.log("⚠️ Could not set DNS servers:", e.message);
}

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Models (keep all imports together)
const Department = require("./models/Department");
const Meat = require("./models/Meat");
const Vegetable = require("./models/Vegetable");
const Hotel = require("./models/Hotel");
const Product = require("./models/Product");
const Bill = require("./models/Bill");
const Payment = require("./models/Payment");
const nodemailer = require("nodemailer");

// ========================
// MongoDB Connection
// ========================
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.log("❌ MONGO_URI is missing. Check backend/.env file");
  process.exit(1);
}

mongoose
  .connect(mongoUri) // Removed forced IPv4 to allow SRV resolution
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// ========================
// Test route
// ========================
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

// ========================
// DEPARTMENT APIs
// ========================

// ✅ Register Department
app.post("/api/department/register", async (req, res) => {
  try {
    const dept = new Department(req.body);
    await dept.save();
    res.status(201).json({
      message: "Department registered successfully",
      department: dept,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login Department
app.post("/api/department/login", async (req, res) => {
  try {
    const { storeName, password } = req.body;

    const dept = await Department.findOne({ storeName });
    if (!dept) return res.status(404).json({ message: "Account not found" });

    if (dept.password !== password)
      return res.status(401).json({ message: "Wrong password" });

    res.json({
      message: "Login successful",
      department: dept,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Department Profile
app.get("/api/department/:id", async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Department Profile
app.put("/api/department/update/:id", async (req, res) => {
  try {
    const updatedDept = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedDept) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({
      message: "Profile updated successfully",
      department: updatedDept,
    });
  } catch (err) {
    console.log("DEPARTMENT UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// ADMIN APIs
// =========================

// ✅ Get all departments
app.get("/api/admin/departments", async (req, res) => {
  try {
    // ✅ safer than createdAt if timestamps not enabled
    const depts = await Department.find().sort({ _id: -1 });
    res.json(depts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a department
app.delete("/api/admin/department/:id", async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed" });
  }
});

// ✅ Get all meat shops
app.get("/api/admin/meat", async (req, res) => {
  try {
    const shops = await Meat.find().sort({ _id: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a meat shop
app.delete("/api/admin/meat/:id", async (req, res) => {
  try {
    await Meat.findByIdAndDelete(req.params.id);
    res.json({ message: "Meat shop deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed" });
  }
});

// ✅ Get all vegetable shops
app.get("/api/admin/vegetable", async (req, res) => {
  try {
    const shops = await Vegetable.find().sort({ _id: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a vegetable shop
app.delete("/api/admin/vegetable/:id", async (req, res) => {
  try {
    await Vegetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Vegetable shop deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed" });
  }
});

// ✅ Get all hotels (with linked Store info)
app.get("/api/admin/hotel", async (req, res) => {
  try {
    const hotels = await Hotel.find().populate("linkedStoreId", "storeName").sort({ _id: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a hotel
app.delete("/api/admin/hotel/:id", async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ message: "Hotel deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed" });
  }
});

// =========================
// MEAT SHOP APIs
// =========================

// ✅ Register meat shop
app.post("/api/meat/register", async (req, res) => {
  try {
    const meat = new Meat(req.body);
    await meat.save();
    res.status(201).json({ message: "Meat shop registered", meat });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login meat shop
app.post("/api/meat/login", async (req, res) => {
  try {
    const { storeName, password } = req.body;
    const meat = await Meat.findOne({ storeName });

    if (!meat) return res.status(404).json({ message: "Account not found" });
    if (meat.password !== password)
      return res.status(401).json({ message: "Wrong password" });

    res.json({ message: "Login successful", meat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get meat profile
app.get("/api/meat/:id", async (req, res) => {
  try {
    const meat = await Meat.findById(req.params.id);
    if (!meat) return res.status(404).json({ message: "Meat shop not found" });

    res.json(meat);
  } catch (err) {
    console.log("MEAT FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update meat profile
app.put("/api/meat/update/:id", async (req, res) => {
  try {
    const updatedMeat = await Meat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedMeat) {
      return res.status(404).json({ message: "Meat shop not found" });
    }

    res.json({
      message: "Profile updated successfully",
      meat: updatedMeat,
    });
  } catch (err) {
    console.log("MEAT UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// VEGETABLE SHOP APIs
// =========================

// ✅ Register vegetable shop
app.post("/api/vegetable/register", async (req, res) => {
  try {
    const veg = new Vegetable(req.body);
    await veg.save();
    res.status(201).json({
      message: "Vegetable shop registered",
      vegetable: veg,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login vegetable shop
app.post("/api/vegetable/login", async (req, res) => {
  try {
    console.log("✅ LOGIN BODY:", req.body);
    const { storeName, password } = req.body;

    const veg = await Vegetable.findOne({ storeName });

    if (!veg) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (veg.password !== password) {
      return res.status(401).json({ message: "Wrong password" });
    }

    res.json({
      message: "Login successful",
      vegetable: veg
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Get vegetable profile
app.get("/api/vegetable/:id", async (req, res) => {
  try {
    const veg = await Vegetable.findById(req.params.id);
    if (!veg)
      return res.status(404).json({ message: "Vegetable shop not found" });

    res.json(veg);
  } catch (err) {
    console.log("VEGETABLE FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update vegetable profile
app.put("/api/vegetable/update/:id", async (req, res) => {
  try {
    const updatedVeg = await Vegetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedVeg) {
      return res.status(404).json({ message: "Vegetable shop not found" });
    }

    res.json({
      message: "Profile updated successfully",
      vegetable: updatedVeg,
    });
  } catch (err) {
    console.log("VEGETABLE UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================
// Global error handler (optional but useful)
// ========================
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// =========================
// HOTEL APIs
// =========================

// ✅ Helper: Get store model by type
function getStoreModel(storeType) {
  switch (storeType) {
    case "meat": return Meat;
    case "vegetable": return Vegetable;
    case "department":
    default: return Department;
  }
}

// ✅ Helper: Resolve store name for a hotel
async function resolveStoreName(hotel) {
  const hotelObj = hotel.toObject ? hotel.toObject() : { ...hotel };
  try {
    const Model = getStoreModel(hotelObj.storeType);
    const store = await Model.findById(hotelObj.linkedStoreId);
    if (store) {
      hotelObj.linkedStoreName = store.storeName;
    }
  } catch (e) {
    console.error("Could not resolve store name:", e.message);
  }
  return hotelObj;
}

// ✅ Generic Invite Hotel (works for Department, Meat, Vegetable)
app.post("/api/store/invite-hotel", async (req, res) => {
  try {
    const { hotelName, storeId, storeType } = req.body;

    const Model = getStoreModel(storeType);
    const store = await Model.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const registrationLink = `http://localhost:5173/hotel/register?storeId=${storeId}&storeType=${storeType}&hotelName=${encodeURIComponent(hotelName)}`;

    console.log(`📧 [MOCK INVITE] generated for Hotel: ${hotelName}`);
    console.log(`Store: ${store.storeName} (${storeType})`);
    console.log(`Link: ${registrationLink}`);

    res.json({
      message: "Invitation generated successfully",
      link: registrationLink
    });

  } catch (err) {
    console.error("INVITE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Backward compat: old department invite route
app.post("/api/department/invite-hotel", async (req, res) => {
  req.body.storeType = "department";
  // Forward to generic handler
  try {
    const { hotelName, storeId } = req.body;
    const store = await Department.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const registrationLink = `http://localhost:5173/hotel/register?storeId=${storeId}&storeType=department&hotelName=${encodeURIComponent(hotelName)}`;

    res.json({
      message: "Invitation generated successfully",
      link: registrationLink
    });
  } catch (err) {
    console.error("INVITE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Register Hotel (store-type aware)
app.post("/api/hotel/register", async (req, res) => {
  try {
    const { profileImage, hotelName, ownerName, email, phone, location, password, linkedStoreId, storeType } = req.body;
    const type = storeType || "department";

    // Validate store exists in correct collection
    const Model = getStoreModel(type);
    const store = await Model.findById(linkedStoreId);
    if (!store) return res.status(404).json({ message: "Invalid Store Link" });

    // Check if hotel already exists
    const existingHotel = await Hotel.findOne({ hotelName });
    if (existingHotel) return res.status(400).json({ message: "Hotel name already taken" });

    const newHotel = new Hotel({
      profileImage,
      hotelName,
      ownerName,
      email,
      phone,
      location,
      password,
      linkedStoreId,
      storeType: type
    });

    await newHotel.save();

    res.status(201).json({
      message: "Hotel registered successfully",
      hotel: newHotel,
      linkedStoreName: store.storeName
    });

  } catch (err) {
    console.error("HOTEL REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login Hotel (store-type aware)
app.post("/api/hotel/login", async (req, res) => {
  try {
    const { hotelName, password } = req.body;
    const hotel = await Hotel.findOne({ hotelName });

    if (!hotel) return res.status(404).json({ message: "Account not found" });
    if (hotel.password !== password)
      return res.status(401).json({ message: "Wrong password" });

    const hotelObj = await resolveStoreName(hotel);

    res.json({
      message: "Login successful",
      hotelId: hotel._id,
      hotel: hotelObj
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Hotel Profile (store-type aware)
app.get("/api/hotel/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const hotelObj = await resolveStoreName(hotel);
    res.json(hotelObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Hotel Profile (store-type aware)
app.put("/api/hotel/update/:id", async (req, res) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedHotel) return res.status(404).json({ message: "Hotel not found" });

    const hotelObj = await resolveStoreName(updatedHotel);
    res.json(hotelObj);
  } catch (err) {
    console.error("HOTEL UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Hotels by Store (for any store type)
app.get("/api/hotel/by-store/:storeId", async (req, res) => {
  try {
    const hotels = await Hotel.find({ linkedStoreId: req.params.storeId }).sort({ _id: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// PRODUCT APIs
// =========================

// ✅ Add or Update Product
app.post("/api/product/add", async (req, res) => {
  try {
    const { storeId, storeName, name, price } = req.body;

    // Check if product exists for this store
    let product = await Product.findOne({ storeId, name });

    if (product) {
      // Update existing
      product.price = price;
      product.storeName = storeName; // Update store name just in case
      await product.save();
      res.json({ message: "Product updated successfully", product });
    } else {
      // Create new
      const newProduct = new Product({ storeId, storeName, name, price });
      await newProduct.save();
      res.status(201).json({ message: "Product added successfully", product: newProduct });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Products by Store
app.get("/api/product/store/:storeId", async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.params.storeId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Product
app.delete("/api/product/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// BILL APIs
// =========================

// ✅ Save/Update Bill (Morning, Evening, Extra) + Update Hotel Template
app.post("/api/bill/save", async (req, res) => {
  try {
    const { 
      hotelId, date, 
      morningOrders, eveningOrders, extraOrders, 
      morningStatus, eveningStatus, extraStatus,
      totalAmount 
    } = req.body;

    // Check if bill exists for this date and hotel
    let bill = await Bill.findOne({ hotelId, date });

    if (bill) {
      if (morningOrders) bill.morningOrders = morningOrders;
      if (eveningOrders) bill.eveningOrders = eveningOrders;
      if (extraOrders) bill.extraOrders = extraOrders;
      if (morningStatus) bill.morningStatus = morningStatus;
      if (eveningStatus) bill.eveningStatus = eveningStatus;
      if (extraStatus) bill.extraStatus = extraStatus;
      bill.totalAmount = totalAmount;
      await bill.save();
    } else {
      bill = new Bill({
        hotelId,
        date,
        morningOrders: morningOrders || [],
        eveningOrders: eveningOrders || [],
        extraOrders: extraOrders || [],
        morningStatus: morningStatus || "draft",
        eveningStatus: eveningStatus || "draft",
        extraStatus: extraStatus || "draft",
        totalAmount
      });
      await bill.save();
    }

    // Also update the hotel's template (for morning/evening only)
    if (morningOrders || eveningOrders) {
      const updateData = {};
      if (morningOrders) updateData.morningTemplate = morningOrders;
      if (eveningOrders) updateData.eveningTemplate = eveningOrders;
      await Hotel.findByIdAndUpdate(hotelId, updateData);
    }

    res.json({ message: "Bill saved successfully", bill });

  } catch (err) {
    console.error("BILL SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Hotel Order Schedule
app.put("/api/hotel/update-schedule/:id", async (req, res) => {
  try {
    const { morningOrderTime, eveningOrderTime } = req.body;
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id, 
      { morningOrderTime, eveningOrderTime }, 
      { new: true }
    );
    res.json({ message: "Schedule updated", hotel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Bill by Hotel and Date (falls back to hotel template)
app.get("/api/bill/:hotelId", async (req, res) => {
  try {
    const { date } = req.query; // Expecting ?date=YYYY-MM-DD
    const bill = await Bill.findOne({ hotelId: req.params.hotelId, date });
    const hotel = await Hotel.findById(req.params.hotelId);

    const timingInfo = {
      morningOrderTime: hotel?.morningOrderTime || "08:00",
      eveningOrderTime: hotel?.eveningOrderTime || "19:00"
    };

    if (bill) {
      return res.json({ ...bill.toObject(), ...timingInfo });
    }

    // No bill for this date — return template from hotel
    if (hotel && (hotel.morningTemplate.length > 0 || hotel.eveningTemplate.length > 0)) {
      return res.json({
        isTemplate: true,
        morningOrders: hotel.morningTemplate,
        eveningOrders: hotel.eveningTemplate,
        extraOrders: [],
        morningStatus: "draft",
        eveningStatus: "draft",
        extraStatus: "draft",
        ...timingInfo
      });
    }

    return res.json({ message: "No bill found for this date", bill: null, ...timingInfo });

  } catch (err) {
    console.error("BILL FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Incoming Orders for a Store (All Hotels)
app.get("/api/store/incoming-orders/:storeId", async (req, res) => {
  try {
    const { date } = req.query; // e.g., 2026-04-10
    
    // 1. Find all hotels linked to this store
    const hotels = await Hotel.find({ linkedStoreId: new mongoose.Types.ObjectId(req.params.storeId) });
    const hotelIds = hotels.map(h => h._id);

    // 2. Find bills for these hotels on this date
    // Only return if at least one segment is "sent"
    const bills = await Bill.find({
      hotelId: { $in: hotelIds },
      date,
      $or: [
        { morningStatus: "sent" },
        { eveningStatus: "sent" },
        { extraStatus: "sent" }
      ]
    }).populate("hotelId", "hotelName location phone profileImage");

    res.json(bills);
  } catch (err) {
    console.error("INCOMING ORDERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get All Bills for a Hotel (History)
app.get("/api/bill/history/:hotelId", async (req, res) => {
  try {
    const bills = await Bill.find({ hotelId: req.params.hotelId }).sort({ date: -1 });

    // Resolve Store Info for the hotel
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const hotelObj = await resolveStoreName(hotel);

    const billsWithStore = bills.map(bill => ({
      ...bill.toObject(),
      storeName: hotelObj.linkedStoreName,
      storeType: hotelObj.storeType
    }));

    res.json(billsWithStore);
  } catch (err) {
    console.error("HISTORY FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch Linked Hotels for a Store
app.get("/api/store/linked-hotels/:storeId", async (req, res) => {
  try {
    const hotels = await Hotel.find({ linkedStoreId: new mongoose.Types.ObjectId(req.params.storeId) }).select("hotelName location phone profileImage ownerName");
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// PAYMENT APIs
// =========================

// ✅ Initiate Payment (Hotel)
app.post("/api/payments/initiate", async (req, res) => {
  try {
    console.log("💰 [PAYMENT INITIATE] Request Body:", req.body);
    const { hotelId, storeId, storeType, amount } = req.body;
    
    if (!hotelId || !storeId || !storeType || !amount) {
      console.log("❌ [PAYMENT INITIATE] Missing fields");
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    const payment = new Payment({
      hotelId,
      storeId,
      storeType,
      amount,
      status: "pending_confirmation"
    });
    await payment.save();
    console.log("✅ [PAYMENT INITIATE] Record saved:", payment._id);
    res.status(201).json({ message: "Payment initiated", payment });
  } catch (err) {
    console.error("❌ [PAYMENT INITIATE] Save Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Confirm Payment (Store)
app.patch("/api/payments/:id/confirm", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, {
      status: "confirmed",
      confirmedAt: new Date()
    }, { new: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment confirmed", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Reject Payment (Store)
app.patch("/api/payments/:id/reject", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, {
      status: "rejected"
    }, { new: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment rejected", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Pending Amount dynamically + Store UPI ID
app.get("/api/billing/:hotelId/:storeId", async (req, res) => {
  try {
    const { hotelId, storeId } = req.params;

    // Fetch total billed amount
    const bills = await Bill.find({ hotelId });
    const totalBilled = bills.reduce((acc, bill) => acc + (bill.totalAmount || 0), 0);

    // Fetch total confirmed payments
    const payments = await Payment.find({ hotelId, storeId, status: "confirmed" });
    const totalPaid = payments.reduce((acc, payment) => acc + (payment.amount || 0), 0);

    const pendingAmount = totalBilled - totalPaid;

    // Fetch store UPI ID
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const Model = getStoreModel(hotel.storeType);
    const store = await Model.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    res.json({
      totalBilled,
      totalPaid,
      pendingAmount,
      storeUpiId: store.upi || ""
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get incoming payments for Store Dashboard
app.get("/api/payments/store/:storeId", async (req, res) => {
  try {
    const payments = await Payment.find({ storeId }).populate("hotelId", "hotelName location profileImage").sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// Server start (ALWAYS at bottom)
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
