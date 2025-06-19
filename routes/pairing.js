const express = require('express');
const router = express.Router();
const startSocket = require('../startSocket');

router.post('/start', async (req, res) => {
  const { number, method } = req.body;

  try {
    const session = await startSocket(method, number);
    return res.json(session);
  } catch (err) {
    console.error('❌ Pairing error:', err.message);
    return res.json({ success: false, message: err.message });
  }
});

module.exports = router;
