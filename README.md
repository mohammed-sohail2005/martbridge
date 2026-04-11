# Martbridge

Martbridge is a comprehensive B2B platform designed to seamlessly connect wholesale suppliers (Department stores, Meat shops, and Vegetable shops) directly with Hotels. The platform streamlines the daily supply chain, from automated daily ordering to billing management.

## 🚀 Key Features

* **Multi-Store Platform**: Dedicated registration and dashboard interfaces for various store types (Department, Vegetable, Meat).
* **Hotel Client Portal**: Stores can generate custom invitation links to seamlessly onboard their client hotels.
* **Automated Daily Orders**: Hotels can configure "Morning" and "Evening" order templates, eliminating the need to manually enter the same daily requirements.
* **Complete Billing System**: Comprehensive order management, draft tracking, dispatch statuses, and complete order history.
* **Admin Dashboard**: Centralized management to view and administer all registered stores and connected hotels.
* **Dynamic Pricing**: Stores can easily add, update, and manage the unified pricing of their catalog.

## 🛠 Tech Stack

* **Frontend**: React.js powered by Vite, utilizing modern hooks and React Router for navigation.
* **Backend**: Node.js with Express.js providing robust REST API endpoints.
* **Database**: MongoDB utilizing Mongoose for schema modeling and data interactions.

## 📂 Project Structure

* `/backend` - The Node.js and Express server handling API requests, business logic, and database connections.
* `/martbridge-react` - The Vite-powered React frontend application with interactive and responsive user interfaces.

## ⚙️ How to Run Locally

### Prerequisites
* Node.js installed on your machine
* A MongoDB instance/cluster running

### 1. Setting up the Backend
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a `.env` file in the backend directory and add your MongoDB connection string
# Example: MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/martbridge

# Start the server (Typically runs on http://localhost:5000)
npm start
```

### 2. Setting up the Frontend
```bash
# Open a new terminal and navigate to the frontend directory
cd martbridge-react

# Install dependencies
npm install

# Start the development server
npm run dev
```

Once both servers are running, access the application through the URL provided by the Vite development server (usually `http://localhost:5173`).
