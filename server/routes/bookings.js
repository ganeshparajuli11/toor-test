import express from 'express';
import { getBookings, saveBooking, updateBooking, getBookingStats, getPayments } from '../config/bookingStore.js';

const router = express.Router();

// GET /api/bookings - Get all bookings (for admin)
router.get('/', async (req, res) => {
    try {
        const { filter, sort, page = 1, limit = 20 } = req.query;
        const bookings = await getBookings({ filter, sort, page: parseInt(page), limit: parseInt(limit) });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// GET /api/bookings/stats - Get booking statistics (for admin dashboard)
router.get('/stats', async (req, res) => {
    try {
        const stats = await getBookingStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
});

// GET /api/bookings/payments - Get all payments (for admin payments page)
router.get('/payments', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const payments = await getPayments({ page: parseInt(page), limit: parseInt(limit) });
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Failed to fetch payments' });
    }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', async (req, res) => {
    try {
        const bookings = await getBookings({});
        const booking = bookings.data.find(b => b.id === req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Failed to fetch booking' });
    }
});

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
    try {
        const bookingData = req.body;

        // Validate required fields
        if (!bookingData.id || !bookingData.type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const savedBooking = await saveBooking(bookingData);
        res.status(201).json({ success: true, booking: savedBooking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Failed to create booking' });
    }
});

// PUT /api/bookings/:id - Update booking status
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedBooking = await updateBooking(id, updates);
        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Failed to update booking' });
    }
});

// POST /api/bookings/:id/cancel - Cancel a booking
router.post('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBooking = await updateBooking(id, { status: 'cancelled' });

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Failed to cancel booking' });
    }
});

export default router;
