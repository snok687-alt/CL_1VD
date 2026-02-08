// reportRoutes.js - เรียบง่าย ไม่มี Filters
const express = require('express');
const router = express.Router();
const gameReportService = require('../gameReportService');

/**
 * ดึงรายงานผู้เล่นทั้งหมด (แบบง่าย ไม่มี filters)
 */
router.get('/simple-players-report', async (req, res) => {
  try {
    const report = await gameReportService.getAllPlayersSimpleReport();
    res.json(report);
    
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

/**
 * ดึงเฉพาะผู้เล่นออนไลน์
 */
router.get('/online-players', async (req, res) => {
  try {
    const report = await gameReportService.getOnlinePlayers();
    res.json(report);
    
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

module.exports = router;