// routes/linkRoutes.js
const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

// ✅ กำหนดเส้นทางให้ชัดเจน
router.post('/links', linkController.addLink);      
router.get('/links', linkController.getLinks);       
router.put('/links/:id', linkController.updateLink); 
router.delete('/links/:id', linkController.deleteLink);

module.exports = router;