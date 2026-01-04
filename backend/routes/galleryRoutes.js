const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', galleryController.getAllGallery);
router.get('/:id', galleryController.getGalleryById);

// Protected routes (Admin only)
router.post('/', authMiddleware, upload.single('image'), galleryController.createGallery);
router.put('/:id', authMiddleware, upload.single('image'), galleryController.updateGallery);
router.delete('/:id', authMiddleware, galleryController.deleteGallery);

module.exports = router;