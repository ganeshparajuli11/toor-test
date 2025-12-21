import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/admin.js';
import proxyRoutes from './routes/proxy.js';
import paymentRoutes from './routes/payment.js';
import bookingsRoutes from './routes/bookings.js';
import oauthRoutes from './routes/oauth.js';
import hotelsRoutes from './routes/hotels.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/hotels', hotelsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
