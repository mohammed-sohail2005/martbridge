const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const dns = require("dns");
const multer = require("multer");

// Middleware for FormData handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
const Labor = require("./models/Labor");
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
app.put("/api/department/update/:id", upload.single('profileImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Handle Profile Image if exists
    if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      updateData.profileImage = base64Image;
    }

    const updatedDept = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedDept) {
      return res.status(404).json({ message: "Department not found" });
    }

    console.log("✅ [DEPT UPDATE] Success for:", updatedDept.storeName);
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
app.put("/api/meat/update/:id", upload.single('profileImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updatedMeat = await Meat.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedMeat) return res.status(404).json({ message: "Meat shop not found" });

    res.json({ message: "Profile updated successfully", meat: updatedMeat });
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
app.put("/api/vegetable/update/:id", upload.single('profileImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updatedVeg = await Vegetable.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedVeg) return res.status(404).json({ message: "Vegetable shop not found" });

    res.json({ message: "Profile updated successfully", vegetable: updatedVeg });
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

app.put("/api/hotel/update/:id", upload.single('profileImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
    const { storeId, storeName, name, price, stock, minStock, unit } = req.body;

    // Check if product exists for this store
    let product = await Product.findOne({ storeId, name });

    if (product) {
      // Update existing
      product.price = price;
      product.storeName = storeName;
      if (stock !== undefined) product.stock = stock;
      if (minStock !== undefined) product.minStock = minStock;
      if (unit !== undefined) product.unit = unit;
      await product.save();
      res.json({ message: "Product updated successfully", product });
    } else {
      // Create new
      const newProduct = new Product({ 
        storeId, storeName, name, price, 
        stock: stock || 0, 
        minStock: minStock || 5,
        unit: unit || "kg"
      });
      await newProduct.save();
      res.status(201).json({ message: "Product added successfully", product: newProduct });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Product Inventory Directly
app.put("/api/product/update-stock/:id", async (req, res) => {
  try {
    const { stock, minStock, unit } = req.body;
    const updateData = {};
    if (stock !== undefined) updateData.stock = stock;
    if (minStock !== undefined) updateData.minStock = minStock;
    if (unit !== undefined) updateData.unit = unit;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Inventory updated successfully", product });
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
        totalAmount,
        pendingAmount: totalAmount // Initialize pendingAmount
      });
      await bill.save();
    }

    // ✅ Stock Reduction Logic
    const hotel = await Hotel.findById(hotelId);
    if (hotel) {
      const storeId = hotel.linkedStoreId;
      let billUpdated = false;

      const reduceStock = async (items) => {
        for (const item of items) {
          if (item.name && item.quantity) {
            await Product.findOneAndUpdate(
              { storeId, name: item.name },
              { $inc: { stock: -item.quantity } }
            );
          }
        }
      };

      if (bill.morningStatus === "sent" && !bill.morningStockProcessed) {
        await reduceStock(bill.morningOrders);
        bill.morningStockProcessed = true;
        billUpdated = true;
      }
      if (bill.eveningStatus === "sent" && !bill.eveningStockProcessed) {
        await reduceStock(bill.eveningOrders);
        bill.eveningStockProcessed = true;
        billUpdated = true;
      }
      if (bill.extraStatus === "sent" && !bill.extraStockProcessed) {
        await reduceStock(bill.extraOrders);
        bill.extraStockProcessed = true;
        billUpdated = true;
      }

      if (billUpdated) {
        await bill.save();
      }
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
// NEW BILL PAYMENT APIs
// ========================

// ✅ Get Single Bill Details (with store info)
app.get("/api/bills/:billId", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId).populate("hotelId");
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const hotel = bill.hotelId;
    const Model = getStoreModel(hotel.storeType);
    const store = await Model.findById(hotel.linkedStoreId);

    res.json({
      bill,
      storeName: store.storeName,
      storeUpiId: store.upiId || store.upi // support both fields
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Hotel submits payment for a specific bill
app.post("/api/bills/:billId/payment", async (req, res) => {
  try {
    const { amount, utrNumber } = req.body;
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    bill.payments.push({
      amount,
      utrNumber,
      status: "pending",
      paidAt: new Date()
    });

    await bill.save();
    res.json({ message: "Payment submitted for approval", bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Store owner confirms a payment on a bill
app.patch("/api/bills/:billId/payment/:paymentId/confirm", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const payment = bill.payments.id(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: "Payment record not found" });

    if (payment.status === "confirmed") {
        return res.status(400).json({ message: "Payment already confirmed" });
    }

    payment.status = "confirmed";
    payment.confirmedAt = new Date();
    
    // Deduct from pendingAmount
    bill.pendingAmount = (bill.pendingAmount || 0) - payment.amount;
    
    // If fully paid, optionally update status at the top level
    if (bill.pendingAmount <= 0) {
        bill.status = "paid";
    }

    await bill.save();
    res.json({ message: "Payment confirmed and balance updated", bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Store owner rejects a payment on a bill
app.patch("/api/bills/:billId/payment/:paymentId/reject", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const payment = bill.payments.id(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: "Payment record not found" });

    payment.status = "rejected";
    await bill.save();
    res.json({ message: "Payment rejected", bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all pending bill-level payments for a store
app.get("/api/store/:storeId/pending-bill-payments", async (req, res) => {
    try {
        const storeId = req.params.storeId;
        
        // 1. Find all hotels linked to this store
        const hotels = await Hotel.find({ linkedStoreId: new mongoose.Types.ObjectId(storeId) });
        const hotelIds = hotels.map(h => h._id);

        // 2. Find bills for these hotels that have pending payments
        const bills = await Bill.find({
            hotelId: { $in: hotelIds },
            "payments.status": "pending"
        }).populate("hotelId", "hotelName location");

        // 3. Flatten into a list of pending payments
        let pending = [];
        bills.forEach(bill => {
            bill.payments.forEach(pay => {
                if (pay.status === "pending") {
                    pending.push({
                        billId: bill._id,
                        paymentId: pay._id,
                        hotelName: bill.hotelId.hotelName,
                        amount: pay.amount,
                        utrNumber: pay.utrNumber,
                        paidAt: pay.paidAt,
                        date: bill.date
                    });
                }
            });
        });

        res.json(pending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =========================
// LABOR APIs
// =========================

// ✅ Add Labor
app.post("/api/labor/add", async (req, res) => {
  try {
    const labor = new Labor(req.body);
    await labor.save();
    res.status(201).json({ message: "Labor added successfully", labor });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get Labor by Owner
app.get("/api/labor/owner/:ownerId", async (req, res) => {
  try {
    const labors = await Labor.find({ ownerId: req.params.ownerId }).sort({ createdAt: -1 });
    res.json(labors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Labor
app.put("/api/labor/:id", async (req, res) => {
  try {
    const updatedLabor = await Labor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLabor) return res.status(404).json({ message: "Labor record not found" });
    res.json({ message: "Labor updated successfully", labor: updatedLabor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Labor
app.delete("/api/labor/:id", async (req, res) => {
  try {
    await Labor.findByIdAndDelete(req.params.id);
    res.json({ message: "Labor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// Server start (ALWAYS at bottom)
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
