const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const Department = require("./models/Department");
const Vegetable = require("./models/Vegetable");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// ========================
// MongoDB Connection
// ========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

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
      department: dept
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login Department
app.post("/api/department/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const dept = await Department.findOne({ email });

    if (!dept) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (dept.password !== password) {
      return res.status(401).json({ message: "Wrong password" });
    }

    res.json({
      message: "Login successful",
      department: dept
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
        department: updatedDept
      });
  
    } catch (err) {
      console.log("UPDATE ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  });
  

// ========================
// Server start
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
/* =========================
   ADMIN APIs
========================= */

// ✅ Get all departments
app.get("/api/admin/departments", async (req, res) => {
    try {
      const depts = await Department.find().sort({ createdAt: -1 });
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
  const Meat = require("./models/Meat");

/* =========================
   MEAT SHOP APIs
========================= */

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
    const { email, password } = req.body;
    const meat = await Meat.findOne({ email });

    if (!meat) return res.status(404).json({ message: "Account not found" });
    if (meat.password !== password)
      return res.status(401).json({ message: "Wrong password" });

    res.json({ message: "Login successful", meat });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ Get Meat Shop Profile (FOR DASHBOARD)
app.get("/api/meat/:id", async (req, res) => {
  try {
    const meat = await Meat.findById(req.params.id);

    if (!meat) {
      return res.status(404).json({ message: "Meat shop not found" });
    }

    res.json(meat); // ⚠️ must be res.json()
  } catch (err) {
    console.log("MEAT FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// ✅ Update Meat Shop Profile
app.put("/api/meat/update/:id", async (req, res) => {
  try {
    const updatedMeat = await Meat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedMeat) {
      return res.status(404).json({ message: "Meat shop not found" });
    }

    res.json({
      message: "Profile updated successfully",
      meat: updatedMeat
    });

  } catch (err) {
    console.log("MEAT UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
/* =========================
   VEGETABLE SHOP APIs
========================= */

// ✅ Register vegetable shop
app.post("/api/vegetable/register", async (req, res) => {
  try {
    const veg = new Vegetable(req.body);
    await veg.save();
    res.status(201).json({ message: "Vegetable shop registered", vegetable: veg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login vegetable shop
app.post("/api/vegetable/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const veg = await Vegetable.findOne({ email });

    if (!veg) return res.status(404).json({ message: "Account not found" });
    if (veg.password !== password)
      return res.status(401).json({ message: "Wrong password" });

    res.json({ message: "Login successful", vegetable: veg });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Vegetable Shop Profile
app.get("/api/vegetable/:id", async (req, res) => {
  try {
    const veg = await Vegetable.findById(req.params.id);

    if (!veg) {
      return res.status(404).json({ message: "Vegetable shop not found" });
    }

    res.json(veg);
  } catch (err) {
    console.log("VEGETABLE FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Vegetable Shop Profile
app.put("/api/vegetable/update/:id", async (req, res) => {
  try {
    const updatedVeg = await Vegetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedVeg) {
      return res.status(404).json({ message: "Vegetable shop not found" });
    }

    res.json({
      message: "Profile updated successfully",
      vegetable: updatedVeg
    });

  } catch (err) {
    console.log("VEGETABLE UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
