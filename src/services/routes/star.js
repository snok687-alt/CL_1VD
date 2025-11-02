const express = require('express');
const router = express.Router();
const { rateVideo, getRatingByVideoId } = require('../controllers/star');

router.post('/rate', rateVideo);
router.get('/rating/:videoId', getRatingByVideoId);

module.exports = router;
