import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Get all bookings from file
async function getAllBookings() {
    await ensureDataDir();
    try {
        const data = await fs.readFile(BOOKINGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Save all bookings to file
async function saveAllBookings(bookings) {
    await ensureDataDir();
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

/**
 * Get bookings with filtering, sorting and pagination
 */
export async function getBookings({ filter, sort, page = 1, limit = 20 }) {
    let bookings = await getAllBookings();

    // Apply filter
    if (filter && filter !== 'all') {
        bookings = bookings.filter(b => b.type === filter || b.status === filter);
    }

    // Apply sort
    if (sort) {
        bookings.sort((a, b) => {
            switch (sort) {
                case 'latest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'price-high':
                    return (b.totalPrice || 0) - (a.totalPrice || 0);
                case 'price-low':
                    return (a.totalPrice || 0) - (b.totalPrice || 0);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    } else {
        // Default sort by latest
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Calculate pagination
    const total = bookings.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedBookings = bookings.slice(startIndex, startIndex + limit);

    return {
        data: paginatedBookings,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
}

/**
 * Save a new booking
 */
export async function saveBooking(bookingData) {
    const bookings = await getAllBookings();

    // Add timestamp if not present
    const booking = {
        ...bookingData,
        createdAt: bookingData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Check for duplicate
    const existingIndex = bookings.findIndex(b => b.id === booking.id);
    if (existingIndex >= 0) {
        // Update existing
        bookings[existingIndex] = { ...bookings[existingIndex], ...booking };
    } else {
        // Add new
        bookings.push(booking);
    }

    await saveAllBookings(bookings);
    return booking;
}

/**
 * Update an existing booking
 */
export async function updateBooking(id, updates) {
    const bookings = await getAllBookings();
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) {
        return null;
    }

    bookings[index] = {
        ...bookings[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    await saveAllBookings(bookings);
    return bookings[index];
}

/**
 * Get booking statistics for dashboard
 */
export async function getBookingStats() {
    const bookings = await getAllBookings();

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Calculate stats
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    // Revenue calculations
    const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const thisMonthBookings = bookings.filter(b => {
        const date = new Date(b.createdAt);
        return date >= thisMonth && date <= thisMonthEnd;
    });

    const thisMonthRevenue = thisMonthBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const lastMonthBookings = bookings.filter(b => {
        const date = new Date(b.createdAt);
        return date >= lastMonth && date < thisMonth;
    });

    const lastMonthRevenue = lastMonthBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Bookings by type
    const bookingsByType = {
        hotel: bookings.filter(b => b.type === 'hotel').length,
        flight: bookings.filter(b => b.type === 'flight').length,
        cruise: bookings.filter(b => b.type === 'cruise').length,
        car: bookings.filter(b => b.type === 'car').length
    };

    // Recent bookings (last 5)
    const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    // Demo vs Real payments
    const demoBookings = bookings.filter(b => b.isDemo).length;
    const realBookings = bookings.filter(b => !b.isDemo).length;

    return {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        thisMonthBookings: thisMonthBookings.length,
        bookingsByType,
        recentBookings,
        demoBookings,
        realBookings,
        // Calculate growth percentage
        revenueGrowth: lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : thisMonthRevenue > 0 ? 100 : 0,
        bookingGrowth: lastMonthBookings.length > 0
            ? ((thisMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length * 100).toFixed(1)
            : thisMonthBookings.length > 0 ? 100 : 0
    };
}

/**
 * Get payments list for admin
 */
export async function getPayments({ page = 1, limit = 20 }) {
    const bookings = await getAllBookings();

    // Transform bookings to payment records
    const payments = bookings.map(booking => ({
        id: booking.paymentId || `PAY-${booking.id}`,
        bookingId: booking.id,
        amount: booking.totalPrice || 0,
        currency: 'USD',
        status: booking.status === 'cancelled' ? 'refunded' : 'completed',
        method: booking.isDemo ? 'Demo Card' : 'Stripe',
        customerName: booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'Guest',
        customerEmail: booking.guest?.email || 'N/A',
        type: booking.type || 'hotel',
        itemName: booking.title || 'Booking',
        createdAt: booking.createdAt,
        isDemo: booking.isDemo || false
    }));

    // Sort by date (newest first)
    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = payments.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPayments = payments.slice(startIndex, startIndex + limit);

    // Calculate totals
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

    return {
        data: paginatedPayments,
        pagination: {
            page,
            limit,
            total,
            totalPages
        },
        summary: {
            totalTransactions: total,
            totalAmount,
            completedAmount,
            demoTransactions: payments.filter(p => p.isDemo).length,
            realTransactions: payments.filter(p => !p.isDemo).length
        }
    };
}
