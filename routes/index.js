const express = require('express');
const router = express.Router();
const { getHome } = require('../controllers/indexController');
router.get('/', getHome);
module.exports = router;
