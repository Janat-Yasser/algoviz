const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/treesController');
router.get('/', ctrl.getIndex);
module.exports = router;
