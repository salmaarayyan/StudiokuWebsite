const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', testimonialController.getAllTestimonials);
router.get('/:id', testimonialController.getTestimonialById);

// Protected routes (Admin only)
router.post('/', authMiddleware, testimonialController.createTestimonial);
router.put('/:id', authMiddleware, testimonialController.updateTestimonial);
router.delete('/:id', authMiddleware, testimonialController.deleteTestimonial);

module.exports = router;