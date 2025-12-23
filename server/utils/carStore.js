import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARS_FILE = path.join(__dirname, '../data/cars.json');

/**
 * Car Store - Manages car rental data persistence
 */

// Ensure cars file exists
const ensureCarsFile = () => {
    const dir = path.dirname(CARS_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(CARS_FILE)) {
        fs.writeFileSync(CARS_FILE, JSON.stringify({ cars: [], lastUpdated: null }, null, 2));
    }
};

// Read cars from file
const readCars = () => {
    ensureCarsFile();
    try {
        const data = fs.readFileSync(CARS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[CarStore] Error reading cars file:', error);
        return { cars: [], lastUpdated: null };
    }
};

// Write cars to file
const writeCars = (data) => {
    ensureCarsFile();
    try {
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync(CARS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('[CarStore] Error writing cars file:', error);
        return false;
    }
};

/**
 * Get all cars
 * @returns {Array} List of cars
 */
export const getAllCars = async () => {
    const data = readCars();
    return data.cars;
};

/**
 * Get car by ID
 * @param {string} id
 * @returns {Object|null} Car or null
 */
export const getCarById = async (id) => {
    const data = readCars();
    return data.cars.find(c => c.id === id) || null;
};

/**
 * Create a new car
 * @param {Object} carData
 * @returns {Object} Created car
 */
export const createCar = async (carData) => {
    const newCar = {
        id: uuidv4(),
        make: carData.make,
        model: carData.model,
        year: carData.year || new Date().getFullYear(),
        type: carData.type || 'sedan', // sedan, suv, sports, luxury, van, etc.
        transmission: carData.transmission || 'automatic',
        fuelType: carData.fuelType || 'petrol',
        seats: carData.seats || 5,
        doors: carData.doors || 4,
        luggage: carData.luggage || 2,
        location: carData.location,
        pricePerDay: carData.pricePerDay || 0,
        currency: carData.currency || 'USD',
        features: carData.features || [],
        images: carData.images || [],
        available: carData.available !== false,
        status: carData.status || 'active',
        totalRentals: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const data = readCars();
    data.cars.push(newCar);
    writeCars(data);

    return newCar;
};

/**
 * Update car
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null} Updated car or null
 */
export const updateCar = async (id, updates) => {
    const data = readCars();
    const carIndex = data.cars.findIndex(c => c.id === id);

    if (carIndex === -1) return null;

    const { id: _, createdAt, ...allowedUpdates } = updates;

    data.cars[carIndex] = {
        ...data.cars[carIndex],
        ...allowedUpdates,
        updatedAt: new Date().toISOString()
    };

    writeCars(data);
    return data.cars[carIndex];
};

/**
 * Delete car
 * @param {string} id
 * @returns {boolean} Success
 */
export const deleteCar = async (id) => {
    const data = readCars();
    const carIndex = data.cars.findIndex(c => c.id === id);

    if (carIndex === -1) return false;

    data.cars.splice(carIndex, 1);
    writeCars(data);
    return true;
};

/**
 * Update car rental stats
 * @param {string} id
 * @param {number} amount - Rental amount
 * @returns {Object|null} Updated car or null
 */
export const updateCarRentalStats = async (id, amount) => {
    const data = readCars();
    const carIndex = data.cars.findIndex(c => c.id === id);

    if (carIndex === -1) return null;

    data.cars[carIndex].totalRentals += 1;
    data.cars[carIndex].totalRevenue += amount;
    data.cars[carIndex].updatedAt = new Date().toISOString();

    writeCars(data);
    return data.cars[carIndex];
};

export default {
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
    updateCarRentalStats
};
