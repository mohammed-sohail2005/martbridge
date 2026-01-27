# 🛒 MartBridge

MartBridge is a multi-store management platform that connects **Department Stores, Meat Shops, Vegetable Shops, and Catering Agents** with hotels and buyers.  
Each store type has its **own registration, login, dashboard, profile management, and pricing system**, while an **Admin Panel** manages all stores centrally.

---

## 🚀 Current Project Status

### ✅ Implemented & Working
- Department Store
- Meat Shop
- Admin Panel
- MongoDB integration
- Profile update system
- Dashboard UI (modern glassmorphism)
- Image upload using Base64
- Authentication using localStorage
- CRUD operations for stores

### 🔄 In Progress
- Vegetable Store backend integration
- Catering Agent module
- Item & price management per store
- Hotel connection logic
- Admin category-wise filtering

---

## 🧱 Tech Stack

### Frontend
- HTML5
- CSS3 (Glassmorphism UI)
- Vanilla JavaScript
- Fetch API
- localStorage

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- CORS

---

## 🗂️ Project Structure


---

## 🗃️ Database Structure (MongoDB)

**Database Name:** `martbridge`

### Collections

### Common Store Fields
- storeName
- ownerName
- email
- password
- phone
- location
- upi
- profileImage
- latitude
- longitude
- createdAt / updatedAt

---

## 🔐 Authentication Flow

- Register / Login via backend APIs
- On successful login, store ID is saved in `localStorage`
- Dashboards load profile data using stored ID
- Logout clears stored data

### Example
```js
localStorage.setItem("deptId", department._id);
localStorage.setItem("meatId", meat._id);
localStorage.setItem("vegId", vegetable._id);

### Common Store Fields
- storeName
- ownerName
- email
- password
- phone
- location
- upi
- profileImage
- latitude
- longitude
- createdAt / updatedAt

---

## 🔐 Authentication Flow

- Register / Login via backend APIs
- On successful login, store ID is saved in `localStorage`
- Dashboards load profile data using stored ID
- Logout clears stored data

### Example
```js
localStorage.setItem("deptId", department._id);
localStorage.setItem("meatId", meat._id);
localStorage.setItem("vegId", vegetable._id);
POST   /api/meat/register
POST   /api/meat/login
GET    /api/meat/:id
PUT    /api/meat/update/:id
POST   /api/meat/register
POST   /api/meat/login
GET    /api/meat/:id
PUT    /api/meat/update/:id
