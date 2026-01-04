const { Booking, AdminBlock } = require('../models');
const { Op } = require('sequelize');

// Helper: Generate time slots based on package
const generateTimeSlots = (packageType) => {
  const slots = [];
  const startHour = 9;
  const endHour = 20;
  const interval = packageType === 'photobox' ? 15 : 30;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  
  // Add final slot at 20:00
  slots.push('20:00');
  
  return slots;
};

// @desc    Get availability for specific date and package
// @route   GET /api/availability/:date/:package
// @access  Public
exports.getAvailability = async (req, res) => {
  try {
    const { date, package: packageType } = req.params;

    // Generate all possible slots for this package
    const allSlots = generateTimeSlots(packageType);

    // Get booked slots for this date
    const bookedSlots = await Booking.findAll({
      where: {
        booking_date: date,
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      attributes: ['time_slot']
    });

    const bookedTimes = bookedSlots.map(b => b.time_slot);

    // Get blocked slots by admin for this date
    const blockedSlots = await AdminBlock.findAll({
      where: {
        block_date: date
      }
    });

    // Mark slots as available, booked, or blocked
    const availability = allSlots.map(slot => {
      const isBooked = bookedTimes.includes(slot);
      
      const isBlocked = blockedSlots.some(block => {
        return slot >= block.start_time && slot <= block.end_time;
      });

      return {
        time: slot,
        status: isBlocked ? 'blocked' : (isBooked ? 'booked' : 'available'),
        reason: isBlocked ? blockedSlots.find(b => slot >= b.start_time && slot <= b.end_time)?.reason : null
      };
    });

    res.status(200).json({
      success: true,
      date,
      package: packageType,
      slots: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};