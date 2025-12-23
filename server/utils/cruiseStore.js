import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CRUISES_FILE = path.join(__dirname, '../data/cruises.json');

/**
 * Cruise Store - Manages cruise data persistence
 */

// Ensure cruises file exists
const ensureCruisesFile = () => {
    const dir = path.dirname(CRUISES_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(CRUISES_FILE)) {
        fs.writeFileSync(CRUISES_FILE, JSON.stringify({ cruises: [], lastUpdated: null }, null, 2));
    }
};

// Read cruises from file
const readCruises = () => {
    ensureCruisesFile();
    try {
        const data = fs.readFileSync(CRUISES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[CruiseStore] Error reading cruises file:', error);
        return { cruises: [], lastUpdated: null };
    }
};

// Write cruises to file
const writeCruises = (data) => {
    ensureCruisesFile();
    try {
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync(CRUISES_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('[CruiseStore] Error writing cruises file:', error);
        return false;
    }
};

/**
 * Get all cruises
 * @returns {Array} List of cruises
 */
export const getAllCruises = async () => {
    const data = readCruises();
    return data.cruises;
};

/**
 * Get cruise by ID
 * @param {string} id
 * @returns {Object|null} Cruise or null
 */
export const getCruiseById = async (id) => {
    const data = readCruises();
    return data.cruises.find(c => c.id === id) || null;
};

/**
 * Create a new cruise
 * @param {Object} cruiseData
 * @returns {Object} Created cruise
 */
export const createCruise = async (cruiseData) => {
    const newCruise = {
        id: uuidv4(),
        name: cruiseData.name,
        cruiseLine: cruiseData.cruiseLine,
        shipName: cruiseData.shipName || '',
        departure: cruiseData.departure,
        destination: cruiseData.destination,
        duration: cruiseData.duration || '7 nights',
        departureDate: cruiseData.departureDate,
        returnDate: cruiseData.returnDate,
        ports: cruiseData.ports || [],
        description: cruiseData.description || '',
        pricePerPerson: cruiseData.pricePerPerson || 0,
        currency: cruiseData.currency || 'USD',
        capacity: cruiseData.capacity || 0,
        availableCabins: cruiseData.availableCabins || 0,
        cabinTypes: cruiseData.cabinTypes || [],
        amenities: cruiseData.amenities || [],
        images: cruiseData.images || [],
        status: cruiseData.status || 'active',
        totalBookings: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const data = readCruises();
    data.cruises.push(newCruise);
    writeCruises(data);

    return newCruise;
};

/**
 * Update cruise
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null} Updated cruise or null
 */
export const updateCruise = async (id, updates) => {
    const data = readCruises();
    const cruiseIndex = data.cruises.findIndex(c => c.id === id);

    if (cruiseIndex === -1) return null;

    const { id: _, createdAt, ...allowedUpdates } = updates;

    data.cruises[cruiseIndex] = {
        ...data.cruises[cruiseIndex],
        ...allowedUpdates,
        updatedAt: new Date().toISOString()
    };

    writeCruises(data);
    return data.cruises[cruiseIndex];
};

/**
 * Delete cruise
 * @param {string} id
 * @returns {boolean} Success
 */
export const deleteCruise = async (id) => {
    const data = readCruises();
    const cruiseIndex = data.cruises.findIndex(c => c.id === id);

    if (cruiseIndex === -1) return false;

    data.cruises.splice(cruiseIndex, 1);
    writeCruises(data);
    return true;
};

/**
 * Update cruise booking stats
 * @param {string} id
 * @param {number} amount - Booking amount
 * @returns {Object|null} Updated cruise or null
 */
export const updateCruiseBookingStats = async (id, amount) => {
    const data = readCruises();
    const cruiseIndex = data.cruises.findIndex(c => c.id === id);

    if (cruiseIndex === -1) return null;

    data.cruises[cruiseIndex].totalBookings += 1;
    data.cruises[cruiseIndex].totalRevenue += amount;
    data.cruises[cruiseIndex].updatedAt = new Date().toISOString();

    writeCruises(data);
    return data.cruises[cruiseIndex];
};

export default {
    getAllCruises,
    getCruiseById,
    createCruise,
    updateCruise,
    deleteCruise,
    updateCruiseBookingStats
};
