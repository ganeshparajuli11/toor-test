import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ArrowRight, Loader2, AlertCircle, CreditCard, Lock, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import { useApiSettings } from '../contexts/ApiSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api.service';
import ratehawkService from '../services/ratehawk.service';
import './BookingDetail.css';

// Stripe Checkout Form Component
const StripeCheckoutForm = ({ totalPrice, currency, onSuccess, onError, disabled }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create PaymentIntent on backend
      const { data } = await api.post('/payment/create-payment-intent', {
        amount: Math.round(totalPrice * 100), // Stripe uses cents
        currency: currency.toLowerCase()
      });

      const { clientSecret } = data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        setError(result.error.message);
        onError?.(result.error.message);
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      console.error('Payment failed:', err);
      const errorMsg = err.response?.data?.error || 'Payment failed. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-checkout-form">
      <div className="card-element-container">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }} />
      </div>
      {error && <div className="payment-error">{error}</div>}

      <button
        type="submit"
        disabled={!stripe || processing || disabled}
        className="pay-now-button"
      >
        {processing ? (
          <>
            <Loader2 className="spin" size={20} />
            Processing...
          </>
        ) : (
          <>
            <Lock size={18} />
            Pay {currency === 'USD' ? '$' : currency} {totalPrice.toLocaleString()}
          </>
        )}
      </button>
    </form>
  );
};

// Demo Payment Form (when Stripe is not configured)
const DemoPaymentForm = ({ totalPrice, currency, onSuccess, disabled }) => {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleDemoPayment = async (e) => {
    e.preventDefault();

    if (!cardNumber || !expiry || !cvc || !cardName) {
      toast.error('Please fill in all card details');
      return;
    }

    setProcessing(true);
    toast.loading('Processing payment...');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.dismiss();

    const demoPaymentIntent = {
      id: `demo_pi_${Date.now()}`,
      status: 'succeeded',
      amount: totalPrice * 100,
      currency: currency,
      created: Date.now(),
      isDemo: true
    };

    setProcessing(false);
    onSuccess(demoPaymentIntent);
  };

  return (
    <form onSubmit={handleDemoPayment} className="demo-payment-form">
      <div className="demo-mode-banner">
        <AlertCircle size={20} />
        <div>
          <strong>Demo Mode</strong>
          <p>Use any test card. Try: 4242 4242 4242 4242</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Cardholder Name</label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className="form-input"
          placeholder="John Doe"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Card Number</label>
        <div className="input-with-icon">
          <CreditCard size={20} />
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="form-input"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            required
          />
        </div>
      </div>

      <div className="card-row">
        <div className="form-group">
          <label className="form-label">Expiry Date</label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            className="form-input"
            placeholder="MM/YY"
            maxLength={5}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">CVC</label>
          <input
            type="text"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
            className="form-input"
            placeholder="123"
            maxLength={4}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="pay-now-button"
        disabled={processing || disabled}
      >
        {processing ? (
          <>
            <Loader2 className="spin" size={20} />
            Processing...
          </>
        ) : (
          <>
            <Lock size={18} />
            Pay {currency === 'USD' ? '$' : currency} {totalPrice.toLocaleString()} (Demo)
          </>
        )}
      </button>

      <p className="demo-note">This is a demo payment. No real charges will be made.</p>
    </form>
  );
};

/**
 * Booking Detail Page
 * Displays complete booking flow with room selection, guest details, and payment
 */
const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { apiSettings } = useApiSettings();
  const { currency: contextCurrency, formatCurrency } = useLanguage();

  // Get booking parameters from URL
  const matchHash = searchParams.get('matchHash');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = searchParams.get('adults') || 2;
  const children = searchParams.get('children') || 0;
  const rooms = searchParams.get('rooms') || 1;
  const priceFromUrl = searchParams.get('price');
  const hotelName = searchParams.get('name');
  const hotelLocation = searchParams.get('location');
  const roomName = searchParams.get('roomName');
  // Use URL currency if available, otherwise use context currency
  const currency = searchParams.get('currency') || contextCurrency || 'USD';

  // State management
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('full');
  const [showGSTDetails, setShowGSTDetails] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // RateHawk booking form state
  const [bookingForm, setBookingForm] = useState(null);
  const [bookingFormLoading, setBookingFormLoading] = useState(false);
  const [bookingFormError, setBookingFormError] = useState(null);

  // Stripe state
  const [stripePromise, setStripePromise] = useState(null);

  // Booking completion state
  const [bookingStatus, setBookingStatus] = useState(null); // null, 'processing', 'confirmed', 'failed'
  // eslint-disable-next-line no-unused-vars
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // Initialize Stripe
  useEffect(() => {
    if (apiSettings?.stripe?.publishableKey) {
      setStripePromise(loadStripe(apiSettings.stripe.publishableKey));
    }
  }, [apiSettings]);

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
        // Use URL params to create booking data if API fails
        const bookingFromUrl = {
          ...fallbackBooking,
          property: {
            id: id,
            name: hotelName ? decodeURIComponent(hotelName) : fallbackBooking.property.name,
            location: hotelLocation ? decodeURIComponent(hotelLocation) : fallbackBooking.property.location,
            image: fallbackBooking.property.image
          },
          checkIn: checkIn || fallbackBooking.checkIn,
          checkOut: checkOut || fallbackBooking.checkOut,
          guests: {
            adults: parseInt(adults) || fallbackBooking.guests.adults,
            children: parseInt(children) || fallbackBooking.guests.children,
            rooms: parseInt(rooms) || fallbackBooking.guests.rooms
          },
          rooms: roomName ? [{
            id: 1,
            name: decodeURIComponent(roomName),
            adults: parseInt(adults) || 2,
            children: parseInt(children) || 0,
            amenities: ['Selected Room'],
            price: parseFloat(priceFromUrl) || 0,
            selected: true
          }] : fallbackBooking.rooms,
          pricing: {
            ...fallbackBooking.pricing,
            totalAmount: parseFloat(priceFromUrl) || fallbackBooking.pricing.totalAmount
          }
        };
        setBooking(bookingFromUrl);
        setSelectedRooms(bookingFromUrl.rooms.filter(r => r.selected).map(r => r.id));
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hotelName, hotelLocation, checkIn, checkOut, adults, children, rooms, roomName, priceFromUrl]);

  // Create RateHawk booking form when matchHash is available
  useEffect(() => {
    const initBookingForm = async () => {
      if (!matchHash) {
        console.log('[BookingDetail] No matchHash provided, skipping booking form creation');
        return;
      }

      setBookingFormLoading(true);
      setBookingFormError(null);

      try {
        console.log('[BookingDetail] Creating booking form with matchHash:', matchHash);
        const result = await ratehawkService.createBookingForm(matchHash);

        if (result.success) {
          console.log('[BookingDetail] Booking form created:', result);
          setBookingForm(result);
          toast.success('Booking session initialized');
        } else {
          console.error('[BookingDetail] Booking form error:', result.error);
          setBookingFormError(result.error);
          // Don't show error toast for rate_not_found - it's expected for old/expired rates
          if (result.error !== 'rate_not_found') {
            toast.error(`Booking setup failed: ${result.error}`);
          }
        }
      } catch (error) {
        console.error('[BookingDetail] Booking form exception:', error);
        setBookingFormError(error.message);
      } finally {
        setBookingFormLoading(false);
      }
    };

    initBookingForm();
  }, [matchHash]);

  // Calculate total price
  const calculateTotal = useCallback(() => {
    if (!booking) return parseFloat(priceFromUrl) || 0;

    const selectedRoomPrices = booking.rooms
      .filter(room => selectedRooms.includes(room.id))
      .reduce((sum, room) => sum + room.price, 0);

    const basePrice = selectedRoomPrices > 0 ? selectedRoomPrices : (parseFloat(priceFromUrl) || 0);
    const discount = appliedCoupon?.discount || 0;
    const afterDiscount = basePrice - discount;
    const taxes = afterDiscount * 0.18; // 18% tax

    return Math.round((afterDiscount + taxes) * 100) / 100;
  }, [booking, selectedRooms, priceFromUrl, appliedCoupon]);

  // Poll booking status until confirmed or failed
  // RateHawk recommends polling every 5 seconds
  const pollBookingStatus = useCallback(async (partnerOrderId, maxAttempts = 24) => {
    // 24 attempts * 5 seconds = 2 minutes max polling time
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;
      console.log(`[BookingDetail] Checking booking status (attempt ${attempts}/${maxAttempts})`);

      try {
        const statusResult = await ratehawkService.checkBookingStatus(partnerOrderId);
        const status = statusResult.status?.toLowerCase();
        console.log('[BookingDetail] Booking status:', status, statusResult);

        if (status === 'ok') {
          // Booking completed successfully
          setBookingStatus('confirmed');
          setBookingConfirmation(statusResult);
          toast.success('Booking confirmed!');
          return true;
        } else if (status === 'error') {
          // Booking failed
          setBookingStatus('failed');
          toast.error(statusResult.error || 'Booking failed. Please try again.');
          return true;
        } else if (status === 'processing') {
          // Still processing - poll again after 5 seconds
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            return await checkStatus();
          }
        } else if (status === '3ds') {
          // 3D Secure check required (shouldn't happen with deposit payment)
          console.warn('[BookingDetail] 3DS check requested but using deposit payment');
          setBookingStatus('failed');
          toast.error('Payment verification required. Please contact support.');
          return true;
        }

        // If we've reached max attempts without a final status
        if (attempts >= maxAttempts) {
          // Per RateHawk docs: always send a final status request at last second
          // If still processing after max attempts, assume success
          console.log('[BookingDetail] Max polling attempts reached, assuming success');
          setBookingStatus('confirmed');
          toast.success('Booking submitted successfully!');
          return true;
        }

        // Unknown status or API error - try again
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return await checkStatus();
        }

        return false;
      } catch (error) {
        console.error('[BookingDetail] Status check error:', error);
        // Per RateHawk docs: on timeout/unknown/5xx, continue polling
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return await checkStatus();
        }
        // After max attempts with errors, show failure
        setBookingStatus('failed');
        toast.error('Unable to confirm booking status. Please check your bookings page.');
        return false;
      }
    };

    await checkStatus();
  }, []);

  // Handle payment success - complete the RateHawk booking
  const handlePaymentSuccess = useCallback(async (paymentIntent) => {
    const isDemo = paymentIntent.isDemo;
    console.log('[BookingDetail] Payment success:', paymentIntent.id, isDemo ? '(demo)' : '');

    // Validate guest data
    const hasEmptyFields = guests.some(guest =>
      !guest.firstName || !guest.lastName || !guest.email || !guest.mobile
    );

    if (hasEmptyFields) {
      toast.error('Please fill all required guest fields');
      return;
    }

    setIsProcessing(true);
    setBookingStatus('processing');

    try {
      // If we have a booking form from RateHawk, complete the booking there
      if (bookingForm?.partner_order_id) {
        console.log('[BookingDetail] Completing RateHawk booking...');

        const totalAmount = calculateTotal();

        const bookingData = {
          partner_order_id: bookingForm.partner_order_id,
          guests: guests.map(g => ({
            first_name: g.firstName,
            last_name: g.lastName,
            is_child: false
          })),
          user: {
            email: guests[0].email,
            phone: guests[0].mobile,
            firstName: guests[0].firstName,
            lastName: guests[0].lastName,
            comment: `Booking from TOOR. Payment: ${paymentIntent.id}`
          },
          payment: {
            type: 'deposit', // We handle payment via Stripe
            amount: String(totalAmount),
            currency: currency
          },
          rooms_count: parseInt(rooms) || 1,
          stripe_payment_id: paymentIntent.id,
          language: 'en'
        };

        const finishResult = await ratehawkService.finishBooking(bookingData);

        if (finishResult.success) {
          console.log('[BookingDetail] Booking submitted, polling status...');
          toast.loading('Confirming your booking...');

          // Poll for booking status
          await pollBookingStatus(bookingForm.partner_order_id);

          toast.dismiss();

          // Redirect to confirmation page
          setTimeout(() => {
            navigate('/bookings', {
              state: {
                bookingConfirmed: true,
                bookingId: bookingForm.partner_order_id,
                paymentId: paymentIntent.id
              }
            });
          }, 2000);
        } else {
          throw new Error(finishResult.error || 'Booking completion failed');
        }
      } else {
        // Fallback: No RateHawk booking form, just save locally
        console.log('[BookingDetail] No RateHawk form, saving booking locally');

        const bookingId = `BK${Date.now().toString().slice(-8)}`;
        const bookingRecord = {
          id: bookingId,
          paymentId: paymentIntent.id,
          type: 'hotel',
          itemId: id,
          hotelName: hotelName ? decodeURIComponent(hotelName) : 'Hotel',
          location: hotelLocation ? decodeURIComponent(hotelLocation) : '',
          checkIn,
          checkOut,
          guests: guests,
          rooms: parseInt(rooms) || 1,
          totalPrice: calculateTotal(),
          currency,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          isDemo
        };

        // Try to save to backend
        try {
          await api.post('/bookings', bookingRecord);
        } catch (err) {
          console.warn('Failed to save to backend, using localStorage:', err.message);
          const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
          existingBookings.push(bookingRecord);
          localStorage.setItem('bookings', JSON.stringify(existingBookings));
        }

        setBookingStatus('confirmed');
        toast.success(`Booking confirmed! ID: ${bookingId}`);

        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      }
    } catch (error) {
      console.error('[BookingDetail] Booking completion error:', error);
      setBookingStatus('failed');
      toast.error(error.message || 'Failed to complete booking');
    } finally {
      setIsProcessing(false);
    }
  }, [bookingForm, guests, rooms, currency, calculateTotal, pollBookingStatus, navigate, id, hotelName, hotelLocation, checkIn, checkOut]);

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

  // Check if payment is ready
  const isPaymentReady = () => {
    // Must have guest details filled
    const hasGuestInfo = guests.every(guest =>
      guest.firstName && guest.lastName && guest.email && guest.mobile
    );

    // If booking form failed, still allow payment (fallback mode)
    return hasGuestInfo;
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

              {/* Payment Section */}
              <div className="booking-section payment-section">
                <h2 className="section-title">
                  <CreditCard size={24} />
                  Payment
                </h2>

                {/* Booking Form Status */}
                {bookingFormLoading && (
                  <div className="booking-form-status loading">
                    <Loader2 className="spin" size={20} />
                    <span>Initializing booking session...</span>
                  </div>
                )}

                {bookingFormError && (
                  <div className="booking-form-status error">
                    <AlertCircle size={20} />
                    <div>
                      <strong>Booking session issue</strong>
                      <p>Payment will be processed but booking may require manual confirmation.</p>
                    </div>
                  </div>
                )}

                {bookingForm && !bookingFormLoading && (
                  <div className="booking-form-status success">
                    <Check size={20} />
                    <span>Booking session ready</span>
                  </div>
                )}

                {/* Booking Status Display */}
                {bookingStatus === 'processing' && (
                  <div className="booking-status-banner processing">
                    <Loader2 className="spin" size={24} />
                    <div>
                      <strong>Processing your booking...</strong>
                      <p>Please wait while we confirm your reservation.</p>
                    </div>
                  </div>
                )}

                {bookingStatus === 'confirmed' && (
                  <div className="booking-status-banner confirmed">
                    <Check size={24} />
                    <div>
                      <strong>Booking Confirmed!</strong>
                      <p>Redirecting to your bookings...</p>
                    </div>
                  </div>
                )}

                {bookingStatus === 'failed' && (
                  <div className="booking-status-banner failed">
                    <AlertCircle size={24} />
                    <div>
                      <strong>Booking Failed</strong>
                      <p>Please try again or contact support.</p>
                    </div>
                  </div>
                )}

                {/* Payment Security Badge */}
                <div className="payment-security-badge">
                  <Lock size={16} />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                {/* Payment Form */}
                {!bookingStatus && (
                  <>
                    {!isPaymentReady() && (
                      <div className="payment-notice">
                        <AlertCircle size={18} />
                        <span>Please fill in all guest details above to proceed with payment</span>
                      </div>
                    )}

                    {stripePromise ? (
                      <Elements stripe={stripePromise}>
                        <StripeCheckoutForm
                          totalPrice={calculateTotal()}
                          currency={currency}
                          onSuccess={handlePaymentSuccess}
                          disabled={!isPaymentReady() || isProcessing || bookingFormLoading}
                        />
                      </Elements>
                    ) : (
                      <DemoPaymentForm
                        totalPrice={calculateTotal()}
                        currency={currency}
                        onSuccess={handlePaymentSuccess}
                        disabled={!isPaymentReady() || isProcessing || bookingFormLoading}
                      />
                    )}
                  </>
                )}

                {/* Payment Features */}
                <div className="payment-features">
                  <div className="feature">
                    <Check size={16} />
                    <span>Free Cancellation (if applicable)</span>
                  </div>
                  <div className="feature">
                    <Check size={16} />
                    <span>Instant Confirmation</span>
                  </div>
                  <div className="feature">
                    <Check size={16} />
                    <span>24/7 Support</span>
                  </div>
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
