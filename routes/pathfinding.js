// Copyright (c) 2026 Janat Yasser. All rights reserved.
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pathfindingController');
router.get('/', ctrl.getIndex);
module.exports = router;
