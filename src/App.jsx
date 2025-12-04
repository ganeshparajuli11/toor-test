import { Routes, Route } from 'react-router-dom';
import TravelBookingPage from './pages/index';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import BookingDetail from './pages/BookingDetail';
import Bookings from './pages/Bookings';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import Cruises from './pages/Cruises';
import Cars from './pages/Cars';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import FlightDetail from './pages/FlightDetail';
import CruiseDetail from './pages/CruiseDetail';
import CarDetail from './pages/CarDetail';
import UniversalBooking from './pages/UniversalBooking';

// Admin imports
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminHotels from './pages/admin/AdminHotels';
import AdminCars from './pages/admin/AdminCars';
import AdminCruises from './pages/admin/AdminCruises';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';
import TestAPI from './pages/admin/TestAPI';
import ProtectedRoute from './components/admin/ProtectedRoute';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TravelBookingPage />} />
      <Route path="/properties" element={<PropertyList />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/flights" element={<Flights />} />
      <Route path="/cruises" element={<Cruises />} />
      <Route path="/cars" element={<Cars />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/property/:id" element={<PropertyDetail />} />
      <Route path="/booking/:id" element={<BookingDetail />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/flight/:id" element={<FlightDetail />} />
      <Route path="/cruise/:id" element={<CruiseDetail />} />
      <Route path="/car/:id" element={<CarDetail />} />
      <Route path="/:type/:id/book" element={<UniversalBooking />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="hotels" element={<AdminHotels />} />
        <Route path="cars" element={<AdminCars />} />
        <Route path="cruises" element={<AdminCruises />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="test-api" element={<TestAPI />} />
      </Route>

      <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h1>404 - Page Not Found</h1></div>} />
    </Routes>
  );
}

export default App;
