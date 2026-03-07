const express = require('express');
const {
  getAllCVEs,
  getCVE,
  getStatistics
} = require('../controllers/cveController.js');

const router = express.Router();

// CVE routes
router.get('/', getAllCVEs);
router.get('/statistics', getStatistics);
router.get('/:id', getCVE);

module.exports = router;
