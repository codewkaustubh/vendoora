import { Router } from 'express';
import * as auth from '../controllers/auth';
import * as vendors from '../controllers/vendors';
import * as inventory from '../controllers/inventory';
import * as bookings from '../controllers/bookings';
import * as marketplace from '../controllers/marketplace';
import * as notifications from '../controllers/notifications';
import * as reels from '../controllers/reels';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// --- AUTHENTICATION ROUTES ---
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticateJWT, auth.me);

// --- VENDOR ENDPOINTS ---
router.get('/vendors', vendors.getAll);
router.get('/vendors/:id', vendors.getById);
router.put('/vendors/profile', authenticateJWT, requireRole(['VENDOR']), vendors.updateProfile);

// --- INVENTORY MANAGEMENT ENDPOINTS ---
router.post('/inventory', authenticateJWT, requireRole(['VENDOR']), inventory.add);
router.put('/inventory/:id/rates', authenticateJWT, requireRole(['VENDOR']), inventory.updateRates);
router.delete('/inventory/:id', authenticateJWT, requireRole(['VENDOR']), inventory.remove);

// --- BOOKINGS & LOGISTICS ENDPOINTS ---
router.post('/bookings', authenticateJWT, bookings.create);
router.get('/bookings/vendor', authenticateJWT, requireRole(['VENDOR']), bookings.getVendorBookings);
router.get('/bookings/client', authenticateJWT, requireRole(['CLIENT', 'ADMIN']), bookings.getClientBookings);
router.put('/bookings/:id/status', authenticateJWT, requireRole(['VENDOR']), bookings.updateStatus);

// --- USED GEAR SECONDARY MARKETPLACE ---
router.post('/marketplace/products', authenticateJWT, marketplace.listProduct);
router.get('/marketplace/products', marketplace.getAllProducts);
router.delete('/marketplace/products/:id', authenticateJWT, marketplace.deleteProduct);

// --- NOTIFICATIONS MANAGEMENT ---
router.get('/notifications', authenticateJWT, notifications.getUserNotifications);
router.put('/notifications/:id/read', authenticateJWT, notifications.markRead);
router.put('/notifications/read-all', authenticateJWT, notifications.markAllRead);

// --- VIBE REELS TRAYS ---
router.post('/reels', authenticateJWT, requireRole(['VENDOR']), reels.add);
router.get('/reels', reels.getAll);
router.delete('/reels/:id', authenticateJWT, requireRole(['VENDOR']), reels.remove);

export default router;
