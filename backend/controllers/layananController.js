const { Layanan } = require('../models');

// @desc    Get all layanan
// @route   GET /api/layanan
// @access  Public
exports.getAllLayanan = async (req, res) => {
  try {
    const layanan = await Layanan.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: layanan.length,
      data: layanan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single layanan
// @route   GET /api/layanan/:id
// @access  Public
exports.getLayananById = async (req, res) => {
  try {
    const layanan = await Layanan.findByPk(req.params.id);

    if (!layanan) {
      return res.status(404).json({
        success: false,
        message: 'Layanan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: layanan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create layanan
// @route   POST /api/layanan
// @access  Private (Admin only)
exports.createLayanan = async (req, res) => {
  try {
    const { name, description, price, duration, max_person, min_person, pricing_type } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and price'
      });
    }

    const layanan = await Layanan.create({
      name,
      description,
      price,
      duration,
      max_person,
      min_person,
      pricing_type: pricing_type || 'per_session'
    });

    res.status(201).json({
      success: true,
      message: 'Layanan created successfully',
      data: layanan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update layanan
// @route   PUT /api/layanan/:id
// @access  Private (Admin only)
exports.updateLayanan = async (req, res) => {
  try {
    const { name, description, price, duration, max_person, min_person, pricing_type } = req.body;

    const layanan = await Layanan.findByPk(req.params.id);

    if (!layanan) {
      return res.status(404).json({
        success: false,
        message: 'Layanan not found'
      });
    }

    await layanan.update({
      name: name ?? layanan.name,
      description: description ?? layanan.description,
      price: price ?? layanan.price,
      duration: duration ?? layanan.duration,
      max_person: max_person ?? layanan.max_person,
      min_person: min_person ?? layanan.min_person,
      pricing_type: pricing_type ?? layanan.pricing_type
    });

    res.status(200).json({
      success: true,
      message: 'Layanan updated successfully',
      data: layanan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete layanan
// @route   DELETE /api/layanan/:id
// @access  Private (Admin only)
exports.deleteLayanan = async (req, res) => {
  try {
    const layanan = await Layanan.findByPk(req.params.id);

    if (!layanan) {
      return res.status(404).json({
        success: false,
        message: 'Layanan not found'
      });
    }

    await layanan.destroy();

    res.status(200).json({
      success: true,
      message: 'Layanan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};