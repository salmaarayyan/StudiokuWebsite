const express = require('express');
const router = express.Router();
const layananController = require('../controllers/layananController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', layananController.getAllLayanan);
router.get('/:id', layananController.getLayananById);

// Protected routes (Admin only)
router.post('/', authMiddleware, layananController.createLayanan);
router.put('/:id', authMiddleware, layananController.updateLayanan);
router.delete('/:id', authMiddleware, layananController.deleteLayanan);

module.exports = router;