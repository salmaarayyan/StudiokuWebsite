const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/', bookingController.createBooking);

// Protected routes (Admin only)
router.get('/', authMiddleware, bookingController.getAllBookings);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.put('/:id', authMiddleware, bookingController.updateBookingStatus);
router.delete('/:id', authMiddleware, bookingController.deleteBooking);

module.exports = router;