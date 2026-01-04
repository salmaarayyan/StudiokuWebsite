const express = require('express');
const router = express.Router();
const adminBlockController = require('../controllers/adminBlockController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, adminBlockController.getAllBlocks);
router.post('/', authMiddleware, adminBlockController.createBlock);
router.delete('/:id', authMiddleware, adminBlockController.deleteBlock);

module.exports = router;