const { Gallery } = require('../models');
const fs = require('fs');
const path = require('path');

// @desc    Get all gallery
// @route   GET /api/gallery
// @access  Public
exports.getAllGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: gallery.length,
      data: gallery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single gallery
// @route   GET /api/gallery/:id
// @access  Public
exports.getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findByPk(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    res.status(200).json({
      success: true,
      data: gallery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create gallery
// @route   POST /api/gallery
// @access  Private (Admin only)
exports.createGallery = async (req, res) => {
  try {
    const { caption } = req.body;

    // Validation - image is required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const image_url = `/uploads/gallery/${req.file.filename}`;

    const gallery = await Gallery.create({
      image_url,
      caption: caption || ''
    });

    res.status(201).json({
      success: true,
      message: 'Gallery created successfully',
      data: gallery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update gallery
// @route   PUT /api/gallery/:id
// @access  Private (Admin only)
exports.updateGallery = async (req, res) => {
  try {
    const { caption } = req.body;

    const gallery = await Gallery.findByPk(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Jika ada file baru, hapus file lama
    if (req.file && gallery.image_url) {
      const oldImagePath = path.join(__dirname, '..', gallery.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update data
    const image_url = req.file 
      ? `/uploads/gallery/${req.file.filename}` 
      : gallery.image_url;

    await gallery.update({
      image_url,
      caption: caption !== undefined ? caption : gallery.caption
    });

    res.status(200).json({
      success: true,
      message: 'Gallery updated successfully',
      data: gallery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete gallery
// @route   DELETE /api/gallery/:id
// @access  Private (Admin only)
exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByPk(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Hapus file gambar
    if (gallery.image_url) {
      const imagePath = path.join(__dirname, '..', gallery.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await gallery.destroy();

    res.status(200).json({
      success: true,
      message: 'Gallery deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};