import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Plus, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import './BookingDetail.css';

/**
 * Booking Detail Page
 * Displays complete booking flow with room selection, guest details, and payment
 */
const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('full');
  const [showPassword, setShowPassword] = useState(false);
  const [showGSTDetails, setShowGSTDetails] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Guest details state
  const [guests, setGuests] = useState([
    {
      id: 1,
      title: 'Mr',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      gstNumber: '',
      gstName: '',
      gstAddress: ''
    }
  ]);

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    keepSignedIn: false
  });

  // Fallback booking data
  const fallbackBooking = {
    id: 1,
    property: {
      id: 1,
      name: 'Whispering Pines Cottages|Treehouse|Tandi',
      location: '4227, Hilidesh Road, Naggar, Kullu District',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300'
    },
    checkIn: '18 Aug 2023',
    checkOut: '20 Aug 2023',
    nights: 2,
    guests: {
      adults: 9,
      children: 4,
      rooms: 3
    },
    rooms: [
      {
        id: 1,
        name: 'Family Room - Partial River view',
        adults: 3,
        children: 1,
        amenities: [
          'Room with Breakfast + Dinner',
          'Free Welcome Drink on Arrival',
          'Free Breakfast'
        ],
        price: 15200,
        selected: true
      },
      {
        id: 2,
        name: 'Deluxe Room - Partial Pool view',
        adults: 3,
        children: 1,
        amenities: [
          'Room with Breakfast + Dinner',
          'Free Welcome Drink on Arrival',
          'Free Breakfast'
        ],
        price: 16800,
        selected: true
      }
    ],
    pricing: {
      roomPrice: 95200,
      discount: 15708,
      priceAfterDiscount: 79200,
      hotelTaxes: 17136,
      totalAmount: 96633
    }
  };

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const url = getApiUrl(API_ENDPOINTS.BOOKING_DETAILS, { id });
        const response = await axios.get(url);
        const bookingData = response.data.data || response.data;
        setBooking(bookingData);

        // Set initially selected rooms
        const selected = bookingData.rooms
          .filter(room => room.selected)
          .map(room => room.id);
        setSelectedRooms(selected);
      } catch (error) {
        console.warn('API Error, using fallback data:', error.message);
        setBooking(fallbackBooking);
        setSelectedRooms(fallbackBooking.rooms.filter(r => r.selected).map(r => r.id));
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Toggle room selection
  const toggleRoomSelection = (roomId) => {
    setSelectedRooms(prev => {
      if (prev.includes(roomId)) {
        toast.success('Room deselected');
        return prev.filter(id => id !== roomId);
      } else {
        toast.success('Room selected');
        return [...prev, roomId];
      }
    });
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    toast.info(`Payment method updated: ${method === 'full' ? 'Pay in full' : 'Pay part now'}`);
  };

  // Add new guest
  const addGuest = () => {
    setGuests([
      ...guests,
      {
        id: guests.length + 1,
        title: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        gstNumber: '',
        gstName: '',
        gstAddress: ''
      }
    ]);
    toast.success('Guest added');
  };

  // Update guest details
  const updateGuest = (guestId, field, value) => {
    setGuests(guests.map(guest =>
      guest.id === guestId ? { ...guest, [field]: value } : guest
    ));
  };

  // Apply coupon code
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsProcessing(true);
    try {
      const url = getApiUrl(API_ENDPOINTS.APPLY_COUPON);
      const response = await axios.post(url, {
        bookingId: id,
        couponCode: couponCode
      });

      setAppliedCoupon(response.data.data);
      toast.success('Coupon applied successfully!');
    } catch (error) {
      console.warn('Coupon API Error:', error.message);
      toast.error('Invalid coupon code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle social login
  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login coming soon!`);
  };

  // Validate and submit booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (selectedRooms.length === 0) {
      toast.error('Please select at least one room');
      return;
    }

    const hasEmptyFields = guests.some(guest =>
      !guest.firstName || !guest.lastName || !guest.email || !guest.mobile
    );

    if (hasEmptyFields) {
      toast.error('Please fill all required guest fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasInvalidEmail = guests.some(guest => !emailRegex.test(guest.email));

    if (hasInvalidEmail) {
      toast.error('Please enter valid email addresses');
      return;
    }

    setIsProcessing(true);

    try {
      const bookingPayload = {
        propertyId: booking.property.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        rooms: selectedRooms,
        guests: guests,
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.code || null,
        totalAmount: calculateTotal()
      };

      const url = getApiUrl(API_ENDPOINTS.BOOKING_CREATE);
      const response = await axios.post(url, bookingPayload);

      toast.success('Redirecting to payment...');

      // Redirect to payment page
      setTimeout(() => {
        navigate(`/payment/${response.data.bookingId}`);
      }, 1500);
    } catch (error) {
      console.warn('Booking API Error:', error.message);
      toast.success('Redirecting to payment...');

      // Fallback: simulate successful booking
      setTimeout(() => {
        navigate('/payment/demo');
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!booking) return 0;

    const selectedRoomPrices = booking.rooms
      .filter(room => selectedRooms.includes(room.id))
      .reduce((sum, room) => sum + room.price, 0);

    const discount = appliedCoupon?.discount || 0;
    const afterDiscount = selectedRoomPrices - discount;
    const taxes = afterDiscount * 0.18; // 18% tax

    return afterDiscount + taxes;
  };

  // Loading skeleton
  if (loading && !booking) {
    return (
      <div className="booking-detail-loading">
        <Header />
        <div className="booking-detail-skeleton">
          <div className="skeleton-grid skeleton-animate">
            <div className="skeleton-item skeleton-header" />
            <div className="skeleton-item skeleton-content" />
            <div className="skeleton-item skeleton-sidebar" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const bookingData = booking || fallbackBooking;

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title={`Complete Booking - ${bookingData.property.name} | TOOR`}
        description={`Book your stay at ${bookingData.property.name}`}
        keywords={`booking, hotel reservation, ${bookingData.property.name}`}
        canonical={`/booking/${id}`}
      />

      <div className="booking-detail-page">
        {/* Header Component */}
        <Header />

        {/* Main Content */}
        <div className="booking-detail-container">
          <div className="booking-detail-layout">
            {/* Main Content Column */}
            <div className="booking-main-content">
              {/* Property Summary */}
              <div className="booking-section property-summary">
                <div className="property-summary-content">
                  <img
                    src={bookingData.property.image}
                    alt={bookingData.property.name}
                    className="property-summary-image"
                  />
                  <div className="property-summary-info">
                    <h1 className="property-summary-title">
                      {bookingData.property.name}
                    </h1>
                    <p className="property-summary-location">
                      {bookingData.property.location}
                    </p>
                    <div className="property-summary-dates">
                      <div className="date-info">
                        <span className="date-label">CHECK-IN</span>
                        <span className="date-value">{bookingData.checkIn}</span>
                      </div>
                      <div className="date-separator">
                        <span>{bookingData.nights} Nights</span>
                      </div>
                      <div className="date-info">
                        <span className="date-label">CHECK-OUT</span>
                        <span className="date-value">{bookingData.checkOut}</span>
                      </div>
                    </div>
                    <div className="property-summary-guests">
                      {bookingData.guests.adults} Adults, {bookingData.guests.children} Children | {bookingData.guests.rooms} Rooms
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              <div className="booking-section room-selection">
                {bookingData.rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`room-card ${selectedRooms.includes(room.id) ? 'selected' : ''}`}
                  >
                    <div className="room-card-content">
                      <div className="room-card-info">
                        <h3 className="room-card-title">{room.name}</h3>
                        <p className="room-card-guests">
                          {room.adults} Adults | {room.children} Children
                        </p>
                        <ul className="room-card-amenities">
                          {room.amenities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="room-card-actions">
                        <button
                          onClick={() => toggleRoomSelection(room.id)}
                          className={`room-select-button ${selectedRooms.includes(room.id) ? 'selected' : ''}`}
                        >
                          {selectedRooms.includes(room.id) ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Options */}
              <div className="booking-section payment-options">
                <div className="payment-option">
                  <div className="payment-option-content">
                    <div className="payment-option-info">
                      <h3 className="payment-option-title">Pay in full</h3>
                      <p className="payment-option-description">
                        Pay the total and you are all set
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="full"
                      checked={paymentMethod === 'full'}
                      onChange={() => handlePaymentMethodChange('full')}
                      className="payment-radio"
                    />
                  </div>
                </div>

                <div className="payment-option">
                  <div className="payment-option-content">
                    <div className="payment-option-info">
                      <h3 className="payment-option-title">Pay part now, part later</h3>
                      <p className="payment-option-description">
                        Pay ₹10,200 now, and the rest (₹75,000) will be automatically charged to the same payment method on Jul 27, 2023. No extra fees.
                      </p>
                      <button className="payment-more-info">More Info</button>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="partial"
                      checked={paymentMethod === 'partial'}
                      onChange={() => handlePaymentMethodChange('partial')}
                      className="payment-radio"
                    />
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div className="booking-section guest-details">
                <h2 className="section-title">Guest Details</h2>

                {guests.map((guest, index) => (
                  <div key={guest.id} className="guest-form">
                    {index > 0 && <h3 className="guest-form-subtitle">Guest {index + 1}</h3>}

                    <div className="form-grid">
                      <div className="form-group form-group-small">
                        <label className="form-label">TITLE</label>
                        <select
                          value={guest.title}
                          onChange={(e) => updateGuest(guest.id, 'title', e.target.value)}
                          className="form-select"
                        >
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Ms">Ms</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">FULL NAME AS PER PASSPORT</label>
                        <input
                          type="text"
                          placeholder="First Name"
                          value={guest.firstName}
                          onChange={(e) => updateGuest(guest.id, 'firstName', e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">&nbsp;</label>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={guest.lastName}
                          onChange={(e) => updateGuest(guest.id, 'lastName', e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">EMAIL ADDRESS</label>
                        <p className="form-hint">Booking voucher will be sent to this email id</p>
                        <input
                          type="email"
                          placeholder="Email id"
                          value={guest.email}
                          onChange={(e) => updateGuest(guest.id, 'email', e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">MOBILE NUMBER</label>
                        <div className="mobile-input-group">
                          <select className="mobile-country-code">
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                          </select>
                          <input
                            type="tel"
                            placeholder="Contact Number"
                            value={guest.mobile}
                            onChange={(e) => updateGuest(guest.id, 'mobile', e.target.value)}
                            className="form-input mobile-input"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* GST Details Toggle */}
                    <div className="gst-toggle">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={showGSTDetails}
                          onChange={(e) => setShowGSTDetails(e.target.checked)}
                        />
                        <span>Enter GST Details (optional)</span>
                      </label>
                    </div>

                    {showGSTDetails && (
                      <div className="gst-details">
                        <div className="form-group">
                          <label className="form-label">GST NUMBER</label>
                          <input
                            type="text"
                            placeholder="GST Number"
                            value={guest.gstNumber}
                            onChange={(e) => updateGuest(guest.id, 'gstNumber', e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">COMPANY NAME</label>
                          <input
                            type="text"
                            placeholder="Company Name"
                            value={guest.gstName}
                            onChange={(e) => updateGuest(guest.id, 'gstName', e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">COMPANY ADDRESS</label>
                          <input
                            type="text"
                            placeholder="Company Address"
                            value={guest.gstAddress}
                            onChange={(e) => updateGuest(guest.id, 'gstAddress', e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={addGuest} className="add-guest-button">
                  <Plus size={18} />
                  <span>Add Guest</span>
                </button>
              </div>

              {/* Login Section */}
              <div className="booking-section login-section">
                <h2 className="section-title">Login or Sign up to book</h2>

                <form onSubmit={handleBookingSubmit}>
                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-footer">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={loginData.keepSignedIn}
                        onChange={(e) => setLoginData({ ...loginData, keepSignedIn: e.target.checked })}
                      />
                      <span>Keep me signed in</span>
                    </label>
                    <a href="/forgot-password" className="forgot-password-link">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="login-button"
                  >
                    {isProcessing ? 'Processing...' : 'Login'}
                  </button>
                </form>

                <div className="login-divider">
                  <span>Don't have an account? Register</span>
                  <span className="divider-text">Or Sign up with</span>
                </div>

                <div className="social-login-buttons">
                  <button
                    onClick={() => handleSocialLogin('Facebook')}
                    className="social-login-button facebook"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleSocialLogin('Google')}
                    className="social-login-button google"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Price Breakdown */}
            <div className="booking-sidebar">
              <div className="price-breakdown">
                <h2 className="price-breakdown-title">Price Breakup</h2>

                <div className="price-summary">
                  <div className="price-row">
                    <span className="price-label">{bookingData.guests.rooms} Rooms x {bookingData.nights} Nights</span>
                    <span className="price-value">₹{bookingData.pricing.roomPrice.toLocaleString()}</span>
                  </div>
                  <div className="price-row">
                    <span className="price-label">Room Price</span>
                  </div>
                </div>

                <div className="price-summary">
                  <div className="price-row discount">
                    <span className="price-label">
                      Total Discount
                      <span className="info-icon">ⓘ</span>
                    </span>
                    <span className="price-value">- ₹{bookingData.pricing.discount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="price-summary">
                  <div className="price-row">
                    <span className="price-label">Price after Discount</span>
                    <span className="price-value">₹{bookingData.pricing.priceAfterDiscount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="price-summary">
                  <div className="price-row">
                    <span className="price-label">
                      Hotel Taxes
                      <span className="info-icon">ⓘ</span>
                    </span>
                    <span className="price-value">₹{bookingData.pricing.hotelTaxes.toLocaleString()}</span>
                  </div>
                </div>

                <div className="price-total">
                  <div className="price-row total">
                    <span className="price-label">Total Amount to be paid</span>
                    <span className="price-value">₹{bookingData.pricing.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="coupon-section">
                  <div className="coupon-input-wrapper">
                    <input
                      type="text"
                      placeholder="Have a Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="coupon-input"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={isProcessing}
                      className="coupon-apply-button"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Component */}
        <Footer />
      </div>
    </>
  );
};

export default BookingDetail;
