const { Booking, Layanan } = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{
        model: Layanan,
        as: 'layanan',
        attributes: ['id', 'name', 'price']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (Admin only)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{
        model: Layanan,
        as: 'layanan',
        attributes: ['id', 'name', 'price']
      }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create booking (Customer)
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      booking_date, 
      booking_time,
      time_slot,
      selected_package,
      additional_person,
      background_choice,
      payment_method,
      total_price,
      layanan_id, 
      notes 
    } = req.body;

    // Validation
    if (!customer_name || !customer_email || !customer_phone || !booking_date || !time_slot || !selected_package || !payment_method || !total_price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // If layanan_id provided, fetch and validate pricing
    let layananData = null;
    if (layanan_id) {
      layananData = await Layanan.findByPk(layanan_id);
      if (!layananData) {
        return res.status(404).json({
          success: false,
          message: 'Layanan not found'
        });
      }

      // Validate price based on pricing_type
      let expectedPrice = 0;
      if (layananData.pricing_type === 'per_person') {
        expectedPrice = layananData.price * (additional_person || 1);
      } else {
        expectedPrice = layananData.price;
      }

      // Check if price matches (allow small decimal differences)
      if (Math.abs(expectedPrice - total_price) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Price mismatch. Expected: ${expectedPrice}, Received: ${total_price}`
        });
      }
    }

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({
      where: {
        booking_date,
        time_slot,
        status: {
          [Op.ne]: 'cancelled'
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const booking = await Booking.create({
      customer_name,
      customer_email,
      customer_phone,
      booking_date,
      booking_time: time_slot,
      time_slot,
      selected_package,
      additional_person: additional_person || 0,
      background_choice: background_choice || null,
      payment_method,
      total_price,
      layanan_id: layanan_id || null,
      notes: notes || '',
      status: 'pending'
    });

    // Send email notification to admin
    try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_TO || 'salmaarifhani@gmail.com',
        subject: 'New Booking - Studioku Jogja',
        html: `
          <h2>New Booking Received</h2>
          <p><strong>Customer Name:</strong> ${customer_name}</p>
          <p><strong>Email:</strong> ${customer_email}</p>
          <p><strong>Phone:</strong> ${customer_phone}</p>
          <p><strong>Package:</strong> ${selected_package}</p>
          <p><strong>Date:</strong> ${booking_date}</p>
          <p><strong>Time:</strong> ${time_slot}</p>
          <p><strong>Additional Person:</strong> ${additional_person || 0}</p>
          <p><strong>Background:</strong> ${background_choice || 'N/A'}</p>
          <p><strong>Payment Method:</strong> ${payment_method}</p>
          <p><strong>Total Price:</strong> Rp ${Number(total_price).toLocaleString('id-ID')}</p>
          <p><strong>Notes:</strong> ${notes || 'None'}</p>
          <p><strong>Status:</strong> Pending</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    const result = await Booking.findByPk(booking.id, {
      include: [{
        model: Layanan,
        as: 'layanan',
        attributes: ['id', 'name', 'price']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
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

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, confirmed, or cancelled'
      });
    }

    await booking.update({
      status: status || booking.status
    });

    // Fetch updated data with layanan relation
    const result = await Booking.findByPk(booking.id, {
      include: [{
        model: Layanan,
        as: 'layanan',
        attributes: ['id', 'name', 'price']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
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

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin only)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.destroy();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};