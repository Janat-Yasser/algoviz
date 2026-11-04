const express = require('express');
const router = express.Router();
const { getHome, getRace } = require('../controllers/indexController');
router.get('/', getHome);
router.get('/race', getRace);
module.exports = router;
