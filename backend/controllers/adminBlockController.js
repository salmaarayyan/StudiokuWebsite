const { AdminBlock } = require('../models');

// @desc    Get all admin blocks
// @route   GET /api/admin/blocks
// @access  Private (Admin only)
exports.getAllBlocks = async (req, res) => {
  try {
    const blocks = await AdminBlock.findAll({
      order: [['block_date', 'DESC'], ['start_time', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: blocks.length,
      data: blocks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create admin block
// @route   POST /api/admin/blocks
// @access  Private (Admin only)
exports.createBlock = async (req, res) => {
  try {
    const { block_date, start_time, end_time, reason } = req.body;

    if (!block_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide block_date, start_time, and end_time'
      });
    }

    const block = await AdminBlock.create({
      block_date,
      start_time,
      end_time,
      reason: reason || 'istirahat'
    });

    res.status(201).json({
      success: true,
      message: 'Block created successfully',
      data: block
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete admin block
// @route   DELETE /api/admin/blocks/:id
// @access  Private (Admin only)
exports.deleteBlock = async (req, res) => {
  try {
    const block = await AdminBlock.findByPk(req.params.id);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      });
    }

    await block.destroy();

    res.status(200).json({
      success: true,
      message: 'Block deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};