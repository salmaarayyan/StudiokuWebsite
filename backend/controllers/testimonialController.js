const { Testimonial, Gallery } = require('../models');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      include: [{
        model: Gallery,
        as: 'gallery',
        attributes: ['id', 'image_url', 'caption']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id, {
      include: [{
        model: Gallery,
        as: 'gallery',
        attributes: ['id', 'image_url', 'caption']
      }]
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create testimonial
// @route   POST /api/testimonials
// @access  Private (Admin only)
exports.createTestimonial = async (req, res) => {
  try {
    const { customer_name, review, rating, gallery_id } = req.body;

    // Validation
    if (!customer_name || !review) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name and review'
      });
    }

    // Validate gallery exists if gallery_id provided
    if (gallery_id) {
      const gallery = await Gallery.findByPk(gallery_id);
      if (!gallery) {
        return res.status(404).json({
          success: false,
          message: 'Gallery not found'
        });
      }
    }

    const testimonial = await Testimonial.create({
      customer_name,
      review,
      rating: rating || null,
      gallery_id: gallery_id || null
    });

    // Fetch with gallery relation
    const result = await Testimonial.findByPk(testimonial.id, {
      include: [{
        model: Gallery,
        as: 'gallery',
        attributes: ['id', 'image_url', 'caption']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update testimonial
// @route   PUT /api/testimonials/:id
// @access  Private (Admin only)
exports.updateTestimonial = async (req, res) => {
  try {
    const { customer_name, review, rating, gallery_id } = req.body;

    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Validate gallery exists if gallery_id provided
    if (gallery_id) {
      const gallery = await Gallery.findByPk(gallery_id);
      if (!gallery) {
        return res.status(404).json({
          success: false,
          message: 'Gallery not found'
        });
      }
    }

    await testimonial.update({
      customer_name: customer_name || testimonial.customer_name,
      review: review || testimonial.review,
      rating: rating !== undefined ? rating : testimonial.rating,
      gallery_id: gallery_id !== undefined ? gallery_id : testimonial.gallery_id
    });

    // Fetch updated data with gallery relation
    const result = await Testimonial.findByPk(testimonial.id, {
      include: [{
        model: Gallery,
        as: 'gallery',
        attributes: ['id', 'image_url', 'caption']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private (Admin only)
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await testimonial.destroy();

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};