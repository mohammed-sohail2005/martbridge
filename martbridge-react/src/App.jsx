import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainDashboard from './pages/MainDashboard';
import LinkedHotels from './pages/Store/LinkedHotels';
import StorePayments from './pages/Store/Payments';
import StoreIncomingOrders from './pages/Store/IncomingOrders';
import { PopupProvider } from './context/PopupContext';
import CustomPopup from './components/CustomPopup';
import './index.css';

// Vegetable Pages
import VegetableRegister from './pages/Vegetable/Register';
import VegetableLogin from './pages/Vegetable/Login';
import VegetableDashboard from './pages/Vegetable/Dashboard';
import VegetableSetPrices from './pages/Vegetable/SetPrices';
import VegetableProfileUpdate from './pages/Vegetable/ProfileUpdate';

// Meat Pages
import MeatRegister from './pages/Meat/Register';
import MeatLogin from './pages/Meat/Login';
import MeatDashboard from './pages/Meat/Dashboard';
import MeatSetPrices from './pages/Meat/SetPrices';
import MeatProfileUpdate from './pages/Meat/ProfileUpdate';

// Department Pages
import DepartmentRegister from './pages/Department/Register';
import DepartmentLogin from './pages/Department/Login';
import DepartmentDashboard from './pages/Department/Dashboard';
import DepartmentSetPrices from './pages/Department/SetPrices';
import DepartmentProfileUpdate from './pages/Department/ProfileUpdate';
import DepartmentCreateHotel from './pages/Department/CreateHotel';

// Hotel Pages
import HotelLogin from './pages/Hotel/Login';
import HotelRegister from './pages/Hotel/Register';
import HotelDashboard from './pages/Hotel/Dashboard';
import HotelProfileUpdate from './pages/Hotel/ProfileUpdate';
import HotelBills from './pages/Hotel/Bills';
import HotelPlaceOrder from './pages/Hotel/PlaceOrder';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';

import LaborManagement from './pages/LaborManagement';
import ScrollToTop from './components/ScrollToTop';
import SplashScreen from './components/SplashScreen';
import NotFound from './pages/NotFound';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <PopupProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainDashboard />} />
          
          {/* Vegetable Routes */}
          <Route path="/vegetable/register" element={<VegetableRegister />} />
          <Route path="/vegetable/login" element={<VegetableLogin />} />
          <Route path="/vegetable/dashboard" element={<VegetableDashboard />} />
          <Route path="/vegetable/set-prices" element={<VegetableSetPrices />} />
          <Route path="/vegetable/hotels" element={<LinkedHotels />} />
          <Route path="/vegetable/payments" element={<StorePayments />} />
          <Route path="/vegetable/orders" element={<StoreIncomingOrders />} />
          <Route path="/vegetable/profile" element={<VegetableProfileUpdate />} />
          <Route path="/vegetable/labor" element={<LaborManagement />} />

          {/* Meat Routes */}
          <Route path="/meat/register" element={<MeatRegister />} />
          <Route path="/meat/login" element={<MeatLogin />} />
          <Route path="/meat/dashboard" element={<MeatDashboard />} />
          <Route path="/meat/set-prices" element={<MeatSetPrices />} />
          <Route path="/meat/hotels" element={<LinkedHotels />} />
          <Route path="/meat/payments" element={<StorePayments />} />
          <Route path="/meat/orders" element={<StoreIncomingOrders />} />
          <Route path="/meat/profile" element={<MeatProfileUpdate />} />
          <Route path="/meat/labor" element={<LaborManagement />} />

          {/* Department Routes */}
          <Route path="/department/register" element={<DepartmentRegister />} />
          <Route path="/department/login" element={<DepartmentLogin />} />
          <Route path="/department/dashboard" element={<DepartmentDashboard />} />
          <Route path="/department/set-prices" element={<DepartmentSetPrices />} />
          <Route path="/department/hotels" element={<LinkedHotels />} />
          <Route path="/department/payments" element={<StorePayments />} />
          <Route path="/department/orders" element={<StoreIncomingOrders />} />
          <Route path="/department/profile" element={<DepartmentProfileUpdate />} />
          <Route path="/department/create-hotel" element={<DepartmentCreateHotel />} />
          <Route path="/department/labor" element={<LaborManagement />} />
          
          {/* Hotel Routes */}
          <Route path="/hotel/login" element={<HotelLogin />} />
          <Route path="/hotel/register" element={<HotelRegister />} />
          <Route path="/hotel/dashboard" element={<HotelDashboard />} />
          <Route path="/hotel/profile" element={<HotelProfileUpdate />} />
          <Route path="/hotel/bills" element={<HotelBills />} />
          <Route path="/hotel/place-order" element={<HotelPlaceOrder />} />
          <Route path="/hotel/labor" element={<LaborManagement />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Add more routes here */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <CustomPopup />
    </PopupProvider>
  );
}

export default App;
