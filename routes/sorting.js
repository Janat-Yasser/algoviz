const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sortingController');
router.get('/', ctrl.getIndex);
router.get('/:id', ctrl.getAlgorithm);
module.exports = router;
