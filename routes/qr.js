const express = require('express');
const router = express.Router();
const startSocket = require('../startSocket');

router.get('/start', async (req, res) => {
  try {
    const session = await startSocket('qr');
    return res.json(session);
  } catch (err) {
    console.error('❌ QR error:', err.message);
    return res.json({ success: false, message: err.message });
  }
});

module.exports = router;
