import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOTELS_FILE = path.join(__dirname, '../data/hotels.json');

/**
 * Hotel Store - Manages hotel data persistence
 */

// Ensure hotels file exists
const ensureHotelsFile = () => {
    const dir = path.dirname(HOTELS_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(HOTELS_FILE)) {
        fs.writeFileSync(HOTELS_FILE, JSON.stringify({ hotels: [], lastUpdated: null }, null, 2));
    }
};

// Read hotels from file
const readHotels = () => {
    ensureHotelsFile();
    try {
        const data = fs.readFileSync(HOTELS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[HotelStore] Error reading hotels file:', error);
        return { hotels: [], lastUpdated: null };
    }
};

// Write hotels to file
const writeHotels = (data) => {
    ensureHotelsFile();
    try {
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync(HOTELS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('[HotelStore] Error writing hotels file:', error);
        return false;
    }
};

/**
 * Get all hotels
 * @returns {Array} List of hotels
 */
export const getAllHotels = async () => {
    const data = readHotels();
    return data.hotels;
};

/**
 * Get hotel by ID
 * @param {string} id
 * @returns {Object|null} Hotel or null
 */
export const getHotelById = async (id) => {
    const data = readHotels();
    return data.hotels.find(h => h.id === id) || null;
};

/**
 * Create a new hotel
 * @param {Object} hotelData
 * @returns {Object} Created hotel
 */
export const createHotel = async (hotelData) => {
    const newHotel = {
        id: uuidv4(),
        name: hotelData.name,
        location: hotelData.location,
        address: hotelData.address || '',
        description: hotelData.description || '',
        rating: hotelData.rating || 0,
        stars: hotelData.stars || 3,
        pricePerNight: hotelData.pricePerNight || 0,
        currency: hotelData.currency || 'USD',
        rooms: hotelData.rooms || 0,
        availableRooms: hotelData.availableRooms || 0,
        amenities: hotelData.amenities || [],
        images: hotelData.images || [],
        status: hotelData.status || 'active',
        totalBookings: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const data = readHotels();
    data.hotels.push(newHotel);
    writeHotels(data);

    return newHotel;
};

/**
 * Update hotel
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null} Updated hotel or null
 */
export const updateHotel = async (id, updates) => {
    const data = readHotels();
    const hotelIndex = data.hotels.findIndex(h => h.id === id);

    if (hotelIndex === -1) return null;

    const { id: _, createdAt, ...allowedUpdates } = updates;

    data.hotels[hotelIndex] = {
        ...data.hotels[hotelIndex],
        ...allowedUpdates,
        updatedAt: new Date().toISOString()
    };

    writeHotels(data);
    return data.hotels[hotelIndex];
};

/**
 * Delete hotel
 * @param {string} id
 * @returns {boolean} Success
 */
export const deleteHotel = async (id) => {
    const data = readHotels();
    const hotelIndex = data.hotels.findIndex(h => h.id === id);

    if (hotelIndex === -1) return false;

    data.hotels.splice(hotelIndex, 1);
    writeHotels(data);
    return true;
};

/**
 * Update hotel booking stats
 * @param {string} id
 * @param {number} amount - Booking amount
 * @returns {Object|null} Updated hotel or null
 */
export const updateHotelBookingStats = async (id, amount) => {
    const data = readHotels();
    const hotelIndex = data.hotels.findIndex(h => h.id === id);

    if (hotelIndex === -1) return null;

    data.hotels[hotelIndex].totalBookings += 1;
    data.hotels[hotelIndex].totalRevenue += amount;
    data.hotels[hotelIndex].updatedAt = new Date().toISOString();

    writeHotels(data);
    return data.hotels[hotelIndex];
};

export default {
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
    updateHotelBookingStats
};
